# 📱 NiaSync Mobile App

**Application mobile Flutter pour la capture automatique des SMS Mobile Money**

Cette application mobile permet de capturer automatiquement les notifications SMS des opérateurs mobile money (Orange Money, MVola, Airtel Money, etc.) et de les transférer vers le backend NiaSync pour analyse et tokenisation.

---

## 🎯 Fonctionnalités

### Capture automatique des SMS
- ✅ **Écoute en arrière-plan** : Fonctionne même quand l'app est fermée
- ✅ **Filtrage intelligent** : Détecte automatiquement les SMS des opérateurs mobile money
- ✅ **Envoi automatique** : Transfert vers le backend NiaSync via webhook
- ✅ **Historique local** : Stockage des SMS envoyés avec statut
- ✅ **Filtres personnalisables** : Ajoutez vos propres opérateurs

### Fonctionnement en arrière-plan
- Service foreground Android pour une surveillance continue
- Tâches périodiques toutes les 15 minutes
- Redémarrage automatique au boot du téléphone
- Économie de batterie optimisée

### Interface utilisateur
- Configuration simple de l'URL du backend
- Historique des SMS capturés
- Statut d'envoi (envoyé/en attente)
- Gestion des filtres personnalisés

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Téléphone (Android/iOS)         │
│                                         │
│  ┌────────────────────────────────┐    │
│  │   SMS reçus (Orange Money,     │    │
│  │   MVola, Airtel Money, etc.)   │    │
│  └──────────────┬─────────────────┘    │
│                 │                       │
│                 ▼                       │
│  ┌────────────────────────────────┐    │
│  │    NiaSync Mobile App          │    │
│  │  - Filtre les SMS MM           │    │
│  │  - Stocke en local             │    │
│  │  - Envoie via HTTP             │    │
│  └──────────────┬─────────────────┘    │
└─────────────────┼─────────────────────-┘
                  │ HTTP POST
                  │ (Webhook)
                  ▼
    ┌────────────────────────────────┐
    │    Backend NiaSync (API)       │
    │  POST /webhook/messages        │
    └──────────────┬─────────────────┘
                   │
                   ▼
    ┌────────────────────────────────┐
    │     PostgreSQL Database        │
    │  Stockage des transactions     │
    └────────────────────────────────┘
```

---

## 📋 Prérequis

- **Flutter** : ≥ 3.0.0
- **Android** : SDK 21+ (Android 5.0+)
- **iOS** : iOS 12.0+
- **Backend NiaSync** : Doit être démarré et accessible

---

## 🚀 Installation

### 1. Installer Flutter

Si Flutter n'est pas encore installé :

```bash
# macOS/Linux
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Vérifier l'installation
flutter doctor
```

### 2. Installer les dépendances

```bash
cd mobile-app
flutter pub get
```

### 3. Configuration Android (requis)

L'application nécessite des permissions spéciales pour lire les SMS.

**Fichier `android/app/src/main/AndroidManifest.xml`** (déjà configuré) :
```xml
<uses-permission android:name="android.permission.RECEIVE_SMS"/>
<uses-permission android:name="android.permission.READ_SMS"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

### 4. Lancer l'application

#### En mode développement

```bash
# Connecter votre téléphone Android en USB avec le débogage activé
# ou démarrer un émulateur

flutter run
```

#### Build APK pour production

```bash
# Build APK
flutter build apk --release

# L'APK sera disponible dans :
# build/app/outputs/flutter-apk/app-release.apk
```

---

## ⚙️ Configuration

### 1. Premier lancement

Au premier lancement, l'application demande :

1. **URL du backend** : L'adresse de votre backend NiaSync
   ```
   Exemple : https://votre-backend.com
   ou http://192.168.1.100:3000 (local)
   ```

2. **Numéro de téléphone** : Votre numéro (pour identification)
   ```
   Exemple : +261 34 12 345 67
   ```

3. **Permissions SMS** : Autoriser l'accès aux SMS

### 2. Filtres des opérateurs

Par défaut, l'app filtre les SMS contenant :
- "orangemoney"
- "mvola"

Vous pouvez ajouter vos propres filtres dans l'interface.

### 3. Service en arrière-plan

Pour assurer le fonctionnement continu :

1. **Désactiver l'optimisation de batterie** pour l'app
2. **Autoriser le démarrage automatique** (selon le téléphone)
3. **Ne pas fermer l'app** depuis le gestionnaire de tâches

---

## 📡 Format des données envoyées

L'application envoie les données au format JSON vers `POST /webhook/messages` :

```json
{
  "id": "message_body_sender_timestamp",
  "body": "Votre transfert de 50000 AR vers Jean (0341234567) est réussi...",
  "sender": "OrangeMoney",
  "phonenumber": "+261341234567",
  "timestamp": "2025-10-30T15:30:00.000Z",
  "sent": false
}
```

---

## 🔧 Développement

### Structure du projet

```
mobile-app/
├── android/           # Configuration Android
├── ios/              # Configuration iOS
├── lib/
│   ├── background/
│   │   └── sms_task_handler.dart  # Gestion des tâches en arrière-plan
│   ├── screens/
│   │   ├── home_screen.dart       # Écran principal
│   │   └── sms_history_screen.dart # Historique des SMS
│   ├── services/
│   │   └── api_service.dart       # Communication avec le backend
│   └── main.dart                  # Point d'entrée
├── pubspec.yaml      # Dépendances Flutter
└── README.md
```

### Dépendances principales

| Package | Usage |
|---------|-------|
| `telephony` | Lecture et écoute des SMS |
| `http` | Requêtes HTTP vers le backend |
| `flutter_foreground_task` | Service foreground Android |
| `workmanager` | Tâches périodiques en arrière-plan |
| `shared_preferences` | Stockage local des paramètres |

### Modifier l'intervalle de synchronisation

Dans `lib/main.dart` :

```dart
await wm.Workmanager().registerPeriodicTask(
  "sendMessagesTask",
  "sendMessagesToAPI",
  frequency: const Duration(minutes: 15), // Modifier ici
  // ...
);
```

---

## 🐛 Débogage

### Vérifier les logs

```bash
# Logs en temps réel
flutter logs

# Logs Android spécifiques
adb logcat | grep -i "niasync"
```

### Problèmes courants

#### Les SMS ne sont pas capturés
- ✅ Vérifier que les permissions SMS sont accordées
- ✅ Vérifier que le service en arrière-plan est actif
- ✅ Désactiver l'optimisation de batterie pour l'app

#### Les SMS ne sont pas envoyés au backend
- ✅ Vérifier que l'URL du backend est correcte
- ✅ Vérifier que le backend est accessible (ping/curl)
- ✅ Vérifier la connexion internet du téléphone
- ✅ Regarder les logs : `flutter logs`

#### L'app s'arrête en arrière-plan
- ✅ Désactiver l'optimisation de batterie
- ✅ Autoriser le démarrage automatique (Samsung, Xiaomi, Huawei)
- ✅ Vérifier que le service foreground est actif

---

## 🔐 Sécurité et Permissions

### Permissions requises

L'application demande les permissions suivantes :

- **READ_SMS** : Lecture des SMS mobile money
- **RECEIVE_SMS** : Réception des nouveaux SMS
- **INTERNET** : Envoi vers le backend
- **FOREGROUND_SERVICE** : Service en arrière-plan
- **RECEIVE_BOOT_COMPLETED** : Démarrage automatique

### Confidentialité

- ✅ Seuls les SMS des opérateurs mobile money sont capturés (filtrés)
- ✅ Les SMS sont stockés localement de manière sécurisée
- ✅ Aucun SMS n'est partagé avec des tiers
- ✅ Communication HTTPS recommandée avec le backend

---

## 🚢 Déploiement

### Google Play Store

Pour publier sur le Play Store :

1. **Créer un compte développeur** Google Play (25$ unique)
2. **Générer un keystore** pour signer l'APK
3. **Build l'app bundle** :
   ```bash
   flutter build appbundle --release
   ```
4. **Upload** sur Google Play Console

### Distribution directe (APK)

Pour distribuer en dehors du Play Store :

1. Build l'APK :
   ```bash
   flutter build apk --release
   ```
2. L'APK sera dans `build/app/outputs/flutter-apk/app-release.apk`
3. Installer sur téléphone : Autoriser "Sources inconnues"

---

## 🔗 Intégration avec NiaSync

Cette app mobile fait partie de l'écosystème NiaSync :

```
┌───────────────────┐
│   Mobile App      │ ──► Capture SMS mobile money
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Backend API     │ ──► Stockage et traitement
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Web DApp        │ ──► Visualisation et tokenisation
└───────────────────┘
```

### Configuration du backend

Assurez-vous que le backend NiaSync accepte les webhooks :

**Backend** (`backend/src/webhook/webhook.controller.ts`) :
```typescript
@Post('messages')
async receiveMessage(@Body() messageDto: CreateWebhookMessageDto) {
  // Traitement du message
}
```

**Frontend** : Allez dans "API / Webhooks" pour voir les messages reçus.

---

## 📱 Opérateurs supportés

### Déjà configurés
- ✅ Orange Money
- ✅ MVola (Madagascar)

### Facilement ajoutables
- Airtel Money
- Telma Money
- M-Pesa
- Wave
- Et tout autre opérateur mobile money

**Pour ajouter un opérateur**, modifiez `lib/main.dart` :
```dart
bool matchesUserFilter = 
    sender.toLowerCase().contains('orangemoney') ||
    sender.toLowerCase().contains('mvola') ||
    sender.toLowerCase().contains('airtelmoney') || // Ajout ici
    userFilters.any((filter) => ...);
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

[Apache License 2.0](../LICENSE)

---

## 🙏 Remerciements

- Flutter et l'équipe Dart
- Plugins utilisés : telephony, workmanager, flutter_foreground_task

---

<div align="center">

**Fait avec ❤️ pour l'écosystème NiaSync**

[Documentation NiaSync](../README.md) • [Backend](../backend/README.md) • [Web App](../web/README.md)

</div>
