import 'dart:convert';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:telephony/telephony.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SmsBackgroundTaskHandler extends TaskHandler {
  final Telephony telephony = Telephony.instance;

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
    await telephony.requestPhoneAndSmsPermissions;

    telephony.listenIncomingSms(
      onNewMessage: (message) async {
        final body = message.body ?? '';
        final sender = message.address ?? '';

        final prefs = await SharedPreferences.getInstance();
        final phoneNumber = prefs.getString('phone_number') ?? 'unknown';
        final userFilters = prefs.getStringList('user_filters') ?? [];

        bool matchesUserFilter = sender.toLowerCase().contains('orangemoney') ||
            sender.toLowerCase().contains('mvola') ||
            userFilters.any(
              (filter) => sender.toLowerCase().contains(filter.toLowerCase()),
            );

        if (matchesUserFilter) {
          await _saveSmsToHistory(body, sender, phoneNumber);
          await _sendPendingSmsAtomically();
        }
      },
      listenInBackground: true,
    );
  }

  @override
  void onRepeatEvent(DateTime timestamp) async {
    await _sendPendingSmsAtomically();
  }

  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {}

  Future<void> _saveSmsToHistory(
      String body, String sender, String phonenumber) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> smsList = prefs.getStringList('sms_history') ?? [];

    final newSms = jsonEncode({
      'body': body,
      'sender': sender,
      'phonenumber': phonenumber,
      'timestamp': DateTime.now().toIso8601String(),
      'sent': false,
      'sending': false,
    });

    smsList.insert(0, newSms);
    await prefs.setStringList('sms_history', smsList);
  }

  Future<void> _sendPendingSmsAtomically() async {
    final prefs = await SharedPreferences.getInstance();
    String apiUrl = prefs.getString('api_url') ?? '';
    if (apiUrl.isEmpty) return;

    List<String> smsList = prefs.getStringList('sms_history') ?? [];
    final userFilters = prefs.getStringList('user_filters') ?? [];
    final storedPhone = prefs.getString('phone_number') ?? 'unknown';

    // Copier en mémoire pour traitement atomique
    List<Map<String, dynamic>> smsMemory = smsList
        .map((s) => Map<String, dynamic>.from(jsonDecode(s)))
        .toList();

    // Marquer tous les messages à envoyer comme "sending=true"
    for (var sms in smsMemory) {
      final sender = sms['sender'] ?? '';
      bool matchesUserFilter = sender.toLowerCase().contains('orangemoney') ||
          sender.toLowerCase().contains('mvola') ||
          userFilters.any(
            (filter) => sender.toLowerCase().contains(filter.toLowerCase()),
          );

      if (!sms['sent'] && !sms['sending'] && matchesUserFilter) {
        sms['sending'] = true;
      }
    }

    // Envoi en mémoire
    for (var sms in smsMemory) {
      if (sms['sending'] == true) {
        final body = sms['body'] ?? '';
        final sender = sms['sender'] ?? '';
        final phoneNumber = sms['phonenumber'] ?? storedPhone;

        bool ok = await ApiService().sendTransaction({
          'body': body,
          'sender': sender,
          'phonenumber': phoneNumber,
        }, apiUrl: apiUrl);

        sms['sent'] = ok;
        sms['sending'] = false;
      }
    }

    // Une seule mise à jour atomique
    List<String> updatedList =
        smsMemory.map((s) => jsonEncode(s)).toList();
    await prefs.setStringList('sms_history', updatedList);
  }
}
