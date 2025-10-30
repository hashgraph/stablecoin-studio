import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'background/sms_task_handler.dart';
import 'screens/home_screen.dart';
import 'package:workmanager/workmanager.dart' as wm;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:telephony/telephony.dart';
import 'services/api_service.dart';

@pragma('vm:entry-point')
void callbackDispatcher() {
  wm.Workmanager().executeTask((task, inputData) async {
    final prefs = await SharedPreferences.getInstance();
    final apiUrl = prefs.getString('api_url') ?? '';
    if (apiUrl.isEmpty) return Future.value(true);

    final telephony = Telephony.instance;
    final phoneNumber = prefs.getString('phone_number') ?? 'unknown';

    List<SmsMessage> allSms = [];

    try {
      allSms = await telephony.getInboxSms(
        columns: [SmsColumn.ADDRESS, SmsColumn.BODY, SmsColumn.DATE],
        sortOrder: [OrderBy(SmsColumn.DATE, sort: Sort.ASC)],
      );
    } catch (e) {
      debugPrint('[callbackDispatcher] getInboxSms error: $e');
    }

    List<String> smsList = prefs.getStringList('sms_history') ?? [];
    final userFilters = prefs.getStringList('user_filters') ?? [];

    for (var sms in allSms) {
      final body = sms.body ?? '';
      final sender = sms.address ?? '';
      final timestamp = sms.date ?? 0;
      final id = '${body}_${sender}_$timestamp';
      
      bool matchesUserFilter = sender.toLowerCase().contains('orangemoney') ||
          sender.toLowerCase().contains('mvola') ||
          userFilters.any((filter) => sender.toLowerCase().contains(filter.toLowerCase()));

      if (!matchesUserFilter) continue;

      final existingIndex = smsList.indexWhere((s) {
        final decoded = jsonDecode(s);
        return decoded['id'] == id;
      });

      bool alreadySent = false;
      if (existingIndex != -1) {
        final existing = jsonDecode(smsList[existingIndex]);
        if (existing['sent'] == true) alreadySent = true;
      }

      if (!alreadySent) {
        final ok = await ApiService().sendTransaction({
          'id': id,
          'body': body,
          'sender': sender,
          'phonenumber': phoneNumber,
          'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
          'sent': false,
        }, apiUrl: apiUrl);

        final newSms = jsonEncode({
          'body': body,
          'sender': sender,
          'phonenumber': phoneNumber,
          'timestamp': DateTime.fromMillisecondsSinceEpoch(timestamp).toIso8601String(),
          'sent': ok,
          'id': id,
        });

        if (existingIndex == -1) {
          smsList.insert(0, newSms);
        } else {
          smsList[existingIndex] = newSms;
        }
      }
    }

    await prefs.setStringList('sms_history', smsList);
    return Future.value(true);
  });
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialisation du service foreground
  FlutterForegroundTask.init(
    androidNotificationOptions: AndroidNotificationOptions(
      channelId: 'sms_channel',
      channelName: 'Surveillance SMS',
      channelDescription: 'Surveille et envoie les SMS en arrière-plan',
      channelImportance: NotificationChannelImportance.HIGH,
      priority: NotificationPriority.MAX,
    ),
    iosNotificationOptions: IOSNotificationOptions(
      showNotification: true,
      playSound: false,
    ),
    foregroundTaskOptions: ForegroundTaskOptions(
      eventAction: ForegroundTaskEventAction.repeat(5000),
      autoRunOnBoot: true,
      autoRunOnMyPackageReplaced: true,
      allowWakeLock: true,
      allowWifiLock: false,
    ),
  );

  // Enregistre le TaskHandler pour le foreground service
  FlutterForegroundTask.setTaskHandler(SmsBackgroundTaskHandler());

  // Initialisation Workmanager
  await wm.Workmanager().initialize(callbackDispatcher);

  // Vérification périodique toutes les 15 minutes
  await wm.Workmanager().registerPeriodicTask(
    "sendMessagesTask",
    "sendMessagesToAPI",
    frequency: const Duration(minutes: 15),
    initialDelay: const Duration(minutes: 1),
    constraints: wm.Constraints(
      networkType: wm.NetworkType.connected,
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nia sync',
      theme: ThemeData(primarySwatch: Colors.blue),
      debugShowCheckedModeBanner: false,
      home: const HomeScreen(),
    );
  }
}
