
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class SmsHistoryScreen extends StatefulWidget {
  // Callback pour notifier HomeScreen d'un nouveau filtre
  final Future<void> Function(String filter) onNewFilter;

  const SmsHistoryScreen({Key? key, required this.onNewFilter}) : super(key: key);

  @override
  State<SmsHistoryScreen> createState() => _SmsHistoryScreenState();
}

class _SmsHistoryScreenState extends State<SmsHistoryScreen> {
  List<Map<String, dynamic>> smsHistory = [];
  List<Map<String, dynamic>> filteredSmsHistory = [];
  final List<String> defaultFilters = ['mvola', 'orangemoney'];
  late List<String> filters;
  String selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    filters = ['all', ...defaultFilters];
    _loadSmsHistory();
    _loadFilters();
  }

  Future<void> _loadSmsHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final smsList = prefs.getStringList('sms_history') ?? [];

    setState(() {
      smsHistory = smsList.map((item) {
        final sms = jsonDecode(item) as Map<String, dynamic>;
        return sms;
      }).toList();
      _applyFilter();
    });
  }

  Future<void> _loadFilters() async {
    final prefs = await SharedPreferences.getInstance();
    final savedFilters = prefs.getStringList('user_filters');
    if (savedFilters != null && savedFilters.isNotEmpty) {
      setState(() {
        filters = ['all', ...savedFilters];
      });
    }
  }

  Future<void> _saveFilters() async {
    final prefs = await SharedPreferences.getInstance();
    final customFilters = filters.where((f) => f != 'all').toList();
    await prefs.setStringList('user_filters', customFilters);
  }

  void _applyFilter() {
    setState(() {
      if (selectedFilter == 'all') {
        filteredSmsHistory = List.from(smsHistory);
      } else {
        filteredSmsHistory = smsHistory.where((sms) {
          final sender = (sms['sender'] ?? '').toLowerCase();
          return sender.contains(selectedFilter.toLowerCase());
        }).toList();

      }


    });
  }

  void _addNewFilter() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add new filter'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Enter keyword',
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
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF000066))),
          ),
          ElevatedButton(
            onPressed: () async {
              final newFilter = controller.text.trim().toLowerCase();
              if (newFilter.isNotEmpty && !filters.contains(newFilter)) {
                setState(() {
                  filters.add(newFilter);
                });
                await _saveFilters();

                Navigator.pop(context); // ferme d'abord le dialog

                // Appel du callback après fermeture
                await widget.onNewFilter(newFilter);
              } else {
                Navigator.pop(context);
              }
            },

            child: const Text('Add', style: TextStyle(color: Color(0xFF000066))),
          ),
        ],
      ),
    );
  }

  void _manageFilters() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Manage filters",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF000066)),
            ),
            const SizedBox(height: 10),
            ...filters.where((f) => f != 'all').map((f) => ListTile(
                  title: Text(f),
                  trailing: defaultFilters.contains(f)
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () async {
                            // Supprime le filtre
                            setState(() {
                              filters.remove(f);
                              if (selectedFilter == f) selectedFilter = 'all';
                            });
                            await _saveFilters();

                            // Supprime les SMS correspondants du stockage local
                            final prefs = await SharedPreferences.getInstance();
                            List<String> smsHistory = prefs.getStringList('sms_history') ?? [];
                            smsHistory.removeWhere((s) {
                              final sender = jsonDecode(s)['sender'] ?? '';
                              return sender.toLowerCase().contains(f.toLowerCase());
                            });

                            await prefs.setStringList('sms_history', smsHistory);

                            // Recharge la liste visible à l’écran
                            await _loadSmsHistory();

                            Navigator.pop(context);
                          },

                        ),
                )),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              onPressed: _addNewFilter,
              icon: const Icon(Icons.add),
              label: const Text('Add filter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF53D5F5),
                foregroundColor: const Color(0xFF000066),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF53D5F5),
        iconTheme: const IconThemeData(color: Color(0xFF000066)),
        title: const Text('SMS History', style: TextStyle(color: Color(0xFF000066))),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'manage') {
                _manageFilters();
              } else {
                setState(() {
                  selectedFilter = value;
                  _applyFilter();
                });
              }
            },
            itemBuilder: (context) => [
              ...filters.map(
                (f) => PopupMenuItem(
                  value: f,
                  child: Text(f[0].toUpperCase() + f.substring(1)),
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'manage',
                child: Row(
                  children: [
                    Icon(Icons.tune, size: 18),
                    SizedBox(width: 8),
                    Text('Manage filters'),
                  ],
                ),
              ),
            ],
            icon: const Icon(Icons.filter_list, color: Color(0xFF000066)),
          ),
        ],
      ),
      body: filteredSmsHistory.isEmpty
          ? const Center(
              child: Text("No SMS stored.", style: TextStyle(color: Colors.grey)),
            )
          : ListView.builder(
              itemCount: filteredSmsHistory.length,
              itemBuilder: (context, index) {
                final sms = filteredSmsHistory[index];
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                  child: InkWell(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('SMS Content'),
                          content: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(sms['body'] ?? 'Empty message', style: const TextStyle(fontSize: 16)),
                              const SizedBox(height: 8),
                              Text(sms['timestamp'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Close', style: TextStyle(color: Color(0xFF000066))),
                            ),
                          ],
                        ),
                      );
                    },
                    child: ListTile(
                      title: Text(sms['body'] ?? 'Empty message', maxLines: 3, overflow: TextOverflow.ellipsis),
                      subtitle: Text(sms['timestamp'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
