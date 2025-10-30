import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String endpoint = 'https://00e7f995-d681-4ffb-a329-429e6a34508f-00-1tfezzxd91f89.riker.replit.dev/webhook/messages/test';

  /// Envoie un seul SMS à l'API
  Future<bool> sendTransaction(Map<String, dynamic> data, {String? apiUrl}) async {
    try {
      final payload = {
        'id': data['id'],
        'message': data['body'] ?? data['Message'],
        'sender': data['sender'] ?? data['Sender'],
        'phonenumber': data['phonenumber'] ?? '',
        'timestamp': data['timestamp'] ?? DateTime.now().toIso8601String(),
        'sent': data['sent'] ?? true,
      };

      final response = await http
          .post(
            Uri.parse(apiUrl ?? endpoint),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Envoie plusieurs SMS à l'API
  Future<void> sendPendingSms(List<Map<String, dynamic>> smsList, {String? apiUrl}) async {
    for (var sms in smsList) {
      final success = await sendTransaction(sms, apiUrl: apiUrl);
    }
  }
}
