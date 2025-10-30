import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:telephony/telephony.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'sms_history_screen.dart';

final Telephony telephony = Telephony.instance;
bool sendLock = false;

/// Vérifie si un SMS correspond à un des filtres
bool matchesAnyFilter(String sender, List<String> userFilters) {
  final lowerSender = sender.toLowerCase();
  if (lowerSender.contains('orangemoney') || lowerSender.contains('mvola')) return true;
  for (final filter in userFilters) {
    if (lowerSender.contains(filter.toLowerCase())) return true;
  }
  return false;
}

/// Handler global pour SMS en background
@pragma('vm:entry-point')
void backgroundMessageHandler(SmsMessage message) async {
  final body = message.body ?? '';
  final sender = message.address ?? '';

  try {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('sending_in_progress') == true) {
      debugPrint("⏳ Background skipped: sending already in progress");
      return;
    }

    final userFilters = prefs.getStringList('user_filters') ?? [];
    final phoneNumber = prefs.getString('phone_number') ?? '';
    final apiUrl = prefs.getString('api_url') ?? '';

    if (phoneNumber.isEmpty) return; // ne pas envoyer si pas de numéro
    if (!matchesAnyFilter(sender, userFilters)) return;

    List<String> smsList = prefs.getStringList('sms_history') ?? [];
    final timestamp = message.date ?? DateTime.now().millisecondsSinceEpoch;
    final id = '${body}_${sender}_$timestamp';

    // Ne rien faire si déjà envoyé
    bool alreadySent = smsList.any((s) {
      final decoded = jsonDecode(s);
      return decoded['id'] == id && decoded['sent'] == true;
    });
    if (alreadySent) return;

    // Ajouter le SMS si non présent
    final newSms = jsonEncode({
      'body': body,
      'sender': sender,
      'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
      'sent': false,
      'sending': false,
      'id': id,
    });
    smsList.insert(0, newSms);
    await prefs.setStringList('sms_history', smsList);

    // Envoyer à l'API
    if (apiUrl.isNotEmpty) {
      bool ok = await ApiService().sendTransaction({
        'id': id,
        'body': body,
        'sender': sender,
        'phonenumber': phoneNumber,
        'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
        'sent': true,
      }, apiUrl: apiUrl);

      if (ok) {
        final index = smsList.indexWhere((s) => jsonDecode(s)['id'] == id);
        if (index != -1) {
          var map = jsonDecode(smsList[index]);
          map['sent'] = true;
          map.remove('sending');
          smsList[index] = jsonEncode(map);
          await prefs.setStringList('sms_history', smsList);
        }
      }
    }
  } catch (e) {
    debugPrint('[backgroundMessageHandler] Error: $e');
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String lastSms = 'No text messages read.';
  String apiStatus = 'Waiting…';
  Color apiStatusColor = Colors.orange;
  bool permissionGranted = true;
  String _apiUrl = '';
  String _phoneNumber = '';

  @override
  void initState() {
    super.initState();
    _loadSettings().then((_) async {
      await _startForegroundService();
      await _initSmsListener();
      // await _sendPendingSms();
    });
  }

  Future<void> _startForegroundService() async {
    try {
      await FlutterForegroundTask.startService(
        notificationTitle: 'Nia sync',
        notificationText: 'Mobile Money transactions forwarding to API',
      );
    } catch (e) {
      debugPrint('Foreground service error: $e');
    }
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _apiUrl = prefs.getString('api_url') ?? '';
      _phoneNumber = prefs.getString('phone_number') ?? '';
    });
  }

  /// Envoie tous les SMS filtrés non envoyés
    Future<void> _sendPendingSms() async {
      try {
        final prefs = await SharedPreferences.getInstance();

        // ✅ Empêche double envoi (foreground + background)
        if (prefs.getBool('sending_in_progress') == true) {
          debugPrint("⏳ Send skipped: Already in progress");
          return;
        }

        // ✅ On verrouille
        await prefs.setBool('sending_in_progress', true);

        if (_phoneNumber.isEmpty) {
          await prefs.setBool('sending_in_progress', false);
          return;
        }

        List<String> smsHistory = prefs.getStringList('sms_history') ?? [];
        final userFilters = prefs.getStringList('user_filters') ?? [];

        List<SmsMessage> allSms = [];
        try {
          allSms = await telephony.getInboxSms(
            columns: [SmsColumn.ADDRESS, SmsColumn.BODY, SmsColumn.DATE],
            sortOrder: [OrderBy(SmsColumn.DATE, sort: Sort.ASC)],
          );
        } catch (e) {
          debugPrint('[sendPendingSms] getInboxSms error: $e');
        }

        for (var sms in allSms) {
          final body = sms.body ?? '';
          final sender = sms.address ?? '';
          final timestamp = sms.date ?? 0;
          final id = '${body}_${sender}_$timestamp';

          if (!matchesAnyFilter(sender, userFilters)) continue;

          final existingIndex = smsHistory.indexWhere((s) => jsonDecode(s)['id'] == id);
          if (existingIndex != -1 && jsonDecode(smsHistory[existingIndex])['sent'] == true) continue;

          if (existingIndex != -1) {
            var map = jsonDecode(smsHistory[existingIndex]);
            map['sending'] = true;
            smsHistory[existingIndex] = jsonEncode(map);
          } else {
            smsHistory.insert(0, jsonEncode({
              'body': body,
              'sender': sender,
              'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
              'sent': false,
              'sending': true,
              'id': id,
            }));
          }
          await prefs.setStringList('sms_history', smsHistory);

          bool ok = false;
          if (_apiUrl.isNotEmpty) {
            ok = await ApiService().sendTransaction({
              'id': id,
              'body': body,
              'sender': sender,
              'phonenumber': _phoneNumber,
              'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
              'sent': true,
            }, apiUrl: _apiUrl);
          }

          final indexToUpdate = smsHistory.indexWhere((s) => jsonDecode(s)['id'] == id);
          if (indexToUpdate != -1) {
            var map = jsonDecode(smsHistory[indexToUpdate]);
            map['sent'] = ok;
            map.remove('sending');
            smsHistory[indexToUpdate] = jsonEncode(map);
          }

          if (mounted) {
            setState(() {
              lastSms = body;
              apiStatus = ok ? '✅ Sent' : '❌ Failed';
              apiStatusColor = ok ? Colors.green : Colors.red;
            });
          }
        }

        await prefs.setStringList('sms_history', smsHistory);
      } catch (e) {
        debugPrint('[sendPendingSms] Error: $e');
      } finally {
        // ✅ On libère le verrou même en cas d’erreur
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('sending_in_progress', false);
      }
    }


  /// Sauvegarde un SMS
  Future<void> _saveSmsToHistory(String body, String sender, int timestamp) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> smsList = prefs.getStringList('sms_history') ?? [];
    final id = '${body}_${sender}_$timestamp';
    if (smsList.any((s) => jsonDecode(s)['id'] == id)) return;

    final newSms = jsonEncode({
      'body': body,
      'sender': sender,
      'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
      'sent': false,
      'id': id,
    });

    smsList.insert(0, newSms);
    await prefs.setStringList('sms_history', smsList);
  }

  /// Écoute les SMS entrants
  Future<void> _initSmsListener() async {
    final granted = await telephony.requestPhoneAndSmsPermissions ?? false;
    setState(() => permissionGranted = granted);
    if (!granted) return;

    telephony.listenIncomingSms(
      onNewMessage: (SmsMessage message) async {
        final body = message.body ?? '';
        final sender = message.address ?? '';
        final timestamp = message.date ?? DateTime.now().millisecondsSinceEpoch;

        if (_phoneNumber.isEmpty) return;

        final prefs = await SharedPreferences.getInstance();
        final userFilters = prefs.getStringList('user_filters') ?? [];

        if (!matchesAnyFilter(sender, userFilters)) return;

        await _saveSmsToHistory(body, sender, timestamp);

        if (_apiUrl.isNotEmpty) {
          bool ok = await ApiService().sendTransaction(
            {
              'id': '${body}_${sender}_${timestamp}',
              'body': body,
              'sender': sender,
              'phonenumber': _phoneNumber,
              'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
            },
            apiUrl: _apiUrl,
          );

          if (mounted) {
            setState(() {
              lastSms = body;
              apiStatus = ok ? '✅ Sent' : '❌ Failed';
              apiStatusColor = ok ? Colors.green : Colors.red;
            });
          }
        }
      },
      listenInBackground: true,
      onBackgroundMessage: backgroundMessageHandler,
    );
  }

  // Dialogue API avec condition sur le numéro
Future<void> _showEndpointDialog(BuildContext context) async {
  final prefs = await SharedPreferences.getInstance();
  final phoneNumber = prefs.getString('phone_number') ?? '';

  if (phoneNumber.isEmpty) {
    // avertissement si pas de numéro configuré
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('⚠️ No phone number'),
        content: const Text('Please add your phone number before setting the API endpoint.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK', style: TextStyle(color: Color(0xFF000066))),
          ),
        ],
      ),
    );
    return;
  }

  final endpointController = TextEditingController(text: _apiUrl);

  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Enter the API URL'),
      content: TextField(
        controller: endpointController,
        decoration: const InputDecoration(
          hintText: 'https://example.com/api',
          focusedBorder: UnderlineInputBorder(
            borderSide: BorderSide(color: Color(0xFF000066)),
          ),
          enabledBorder: UnderlineInputBorder(
            borderSide: BorderSide(color: Color(0xFF000066)),
          ),
        ),
      ),
      actions: [
        TextButton(
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF000066))),
            onPressed: () => Navigator.pop(context)),
        ElevatedButton(
          child: const Text('Save', style: TextStyle(color: Color(0xFF000066))),
          onPressed: () async {
            setState(() => _apiUrl = endpointController.text);
            await prefs.setString('api_url', _apiUrl);
            Navigator.pop(context);
            await _sendPendingSms();
          },
        ),
      ],
    ),
  );
}


  /// Dialogue numéro
  Future<void> _showPhoneNumberDialog(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    final phoneController = TextEditingController(text: _phoneNumber);

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter your phone number'),
        content: TextField(
          controller: phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            hintText: '+261 34 12 345 67',
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF000066)),
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF000066)),
            ),
          ),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF000066))),
            onPressed: () => Navigator.pop(context),
          ),
          ElevatedButton(
            child: const Text('Save', style: TextStyle(color: Color(0xFF000066))),
            onPressed: () async {
              if (phoneController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Phone number cannot be empty')),
                );
                return;
              }
              setState(() => _phoneNumber = phoneController.text.trim());
              await prefs.setString('phone_number', _phoneNumber);
              Navigator.pop(context);
              // await _sendPendingSms();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF53D5F5),
        title: const Text('Nia sync', style: TextStyle(color: Color(0xFF000066))),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: Color(0xFF000066)),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => SmsHistoryScreen(
                  onNewFilter: (filter) async {
                    await processNewFilter(filter);
                  },
                ),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Color(0xFF000066)),
            onPressed: () => _showEndpointDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.phone, color: Color(0xFF000066)),
            onPressed: () => _showPhoneNumberDialog(context),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Card(
              color: Colors.purpleAccent.shade100.withOpacity(0.12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    const Icon(Icons.link, color: Colors.purple),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _apiUrl.isEmpty ? "No endpoint configured" : _apiUrl,
                        style: TextStyle(color: _apiUrl.isEmpty ? Colors.grey[600] : Colors.black87, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Card(
              color: Colors.greenAccent.shade100.withOpacity(0.12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    const Icon(Icons.phone, color: Colors.green),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _phoneNumber.isEmpty ? "No phone number configured" : _phoneNumber,
                        style: TextStyle(color: _phoneNumber.isEmpty ? Colors.grey[600] : Colors.black87, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 3,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Icon(Icons.api, color: apiStatusColor, size: 28),
                    const SizedBox(width: 10),
                    Expanded(child: Text(apiStatus, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: apiStatusColor))),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 3,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('📩 Last filtered SMS :', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(lastSms, style: const TextStyle(fontSize: 14, color: Colors.black87)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),
            Center(
              child: Text(
                permissionGranted ? "📭 Waiting for SMS matching the active filter..." : "⚠️ SMS authorization refused",
                style: TextStyle(color: permissionGranted ? Colors.grey[700] : Colors.red, fontStyle: FontStyle.italic),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Traite immédiatement les SMS existants pour un nouveau filtre
  Future<void> processNewFilter(String filter) async {
    try {
      if (_phoneNumber.isEmpty) return;

      final prefs = await SharedPreferences.getInstance();
      final apiUrl = prefs.getString('api_url') ?? '';

      final allSms = await telephony.getInboxSms(
        columns: [SmsColumn.ADDRESS, SmsColumn.BODY, SmsColumn.DATE],
      );

      final api = ApiService();
      List<String> smsHistory = prefs.getStringList('sms_history') ?? [];

      for (var sms in allSms) {
        final body = sms.body ?? '';
        final sender = sms.address ?? '';
        if (!sender.toLowerCase().contains(filter.toLowerCase())) continue;
        
        final timestamp = sms.date ?? DateTime.now().millisecondsSinceEpoch;
        final id = '${body}_${sender}_$timestamp';

        final existingIndex = smsHistory.indexWhere((s) => jsonDecode(s)['id'] == id);
        if (existingIndex != -1 && jsonDecode(smsHistory[existingIndex])['sent'] == true) continue;

        final data = {
          'id': id,
          'body': body,
          'sender': sender,
          'phonenumber': _phoneNumber,
          'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
          'sent': true,
        };

        final ok = await api.sendTransaction(data, apiUrl: apiUrl);

        final newSms = jsonEncode({
          'body': body,
          'sender': sender,
          'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
          'sent': ok,
          'id': id,
        });

        if (existingIndex == -1) smsHistory.insert(0, newSms);
        else smsHistory[existingIndex] = newSms;

        if (mounted) {
          setState(() {
            lastSms = body;
            apiStatus = ok ? '✅ Sent' : '❌ Failed';
            apiStatusColor = ok ? Colors.green : Colors.red;
          });
        }
      }

      await prefs.setStringList('sms_history', smsHistory);
    } catch (e) {
      debugPrint('❌ processNewFilter error: $e');
    }
  }
}
