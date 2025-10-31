<div align="center">

# 💳 NiaSync

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

**Écosystème complet pour tokeniser le Mobile Money sur blockchain**

*Transformez vos réserves mobile money en stablecoins traçables avec capture automatique des SMS*

[Vue d'ensemble](#-vue-densemble) • [Écosystème](#-lécosystème-niasync) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Le problème résolu](#-le-problème-résolu)
- [L'écosystème NiaSync](#-lécosystème-niasync)
- [Basé sur Hedera Stablecoin Studio](#-basé-sur-hedera-stablecoin-studio)
- [Ce qui a été ajouté](#-ce-qui-a-été-ajouté-par-niasync)
- [Architecture globale](#-architecture-globale)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Démarrage rapide](#-démarrage-rapide)
- [Utilisation](#-utilisation)
- [Documentation](#-documentation)
- [Crédits](#-crédits)
- [Licence](#-licence)

---

## 🌍 Vue d'ensemble

**NiaSync** est un **écosystème complet** qui permet de **tokeniser les réserves de Mobile Money** sur la blockchain Hedera. Il combine une application mobile pour capturer automatiquement les SMS, un backend pour le traitement des données, et une interface web pour la visualisation et la gestion des stablecoins adossés au mobile money.

Project demo link
https://www.canva.com/design/DAG3SKccexI/utw-OgnuC82cRK23SFFhIg/watch?utm_content=DAG3SKccexI&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h351554f269

Deck
https://docs.google.com/presentation/d/1AGz-6eyiqDoy10wttp4mDzQlHjSRQrZyJFKeWdhfRkY/edit?usp=sharing

Github
https://github.com/itsaina207/Nia-HederaAfrica/tree/Nia-HederaAfrica

NiaSync APK
https://drive.google.com/file/d/1uHvBbspMJLeLdk0NoGTPL_BKkb4ol2op/view?usp=drive_link

### En bref

```
📱 App Mobile  →  Capture SMS Orange Money/MVola
         ↓
🔄 Backend API  →  Traite et stocke les transactions  
         ↓
🌐 Web DApp     →  Crée des stablecoins adossés aux réserves
         ↓
⛓️ Blockchain   →  Tokenisation sur Hedera Hashgraph
```

---

## 🎯 Le problème résolu

### En Afrique et marchés émergents

Le mobile money (Orange Money, MVola, Airtel Money, M-Pesa, etc.) est omniprésent mais présente des défis :

❌ **Manque de transparence** sur les réserves  
❌ **Pas d'accès à la DeFi** (finance décentralisée)  
❌ **Difficultés d'interopérabilité** entre opérateurs  
❌ **Traçabilité limitée** des transactions  
❌ **Frais élevés** pour certaines opérations  

### La solution NiaSync

✅ **Capture automatique** : App mobile qui écoute les SMS mobile money 24/7  
✅ **Tokenisation** : Créez des stablecoins adossés à vos réserves  
✅ **Transparence totale** : Preuve de réserve visible publiquement sur blockchain  
✅ **Analytics avancés** : Visualisez tous vos flux mobile money en temps réel  
✅ **Accès DeFi** : Utilisez vos tokens dans l'écosystème blockchain  
✅ **Interopérabilité** : Un token unique pour tous vos opérateurs  

---

## 🚀 L'écosystème NiaSync

NiaSync est composé de **3 modules** qui travaillent ensemble :

### 1. 📱 Application Mobile (Flutter)

**Rôle** : Capture automatique des SMS mobile money

```
Orange Money: "Transfert de 50000 AR réussi..."
         ↓
📱 NiaSync App capte le SMS
         ↓
🔄 Envoie vers le backend via webhook
```

**Fonctionnalités** :
- Écoute automatique des SMS en arrière-plan
- Filtrage intelligent (Orange Money, MVola, etc.)
- Fonctionne 24/7 même quand l'app est fermée
- Support Android et iOS

👉 [Documentation de l'app mobile](./mobile-app/README.md)

---

### 2. 🔄 Backend API (NestJS + PostgreSQL)

**Rôle** : Traitement et stockage des transactions mobile money

```
POST /webhook/messages  ← Reçoit les SMS de l'app mobile
         ↓
💾 Stocke dans PostgreSQL
         ↓
📊 Calcule les réserves et statistiques
         ↓
GET /webhook/messages   ← Fournit les données à la web app
```

**Fonctionnalités** :
- API REST pour webhooks
- Stockage sécurisé des transactions
- Calcul automatique des réserves
- Coordination des transactions multisignatures

👉 [Documentation du backend](./backend/README.md)

---

### 3. 🌐 Web DApp (React)

**Rôle** : Interface complète pour visualiser et tokeniser

**Modules ajoutés par NiaSync** :

#### 📊 Mobile Money Management
- Import CSV ou webhooks automatiques
- Graphiques interactifs des flux (Plotly.js)
- Analyse par type de transaction
- Historique complet

#### 📈 Analytics
- Ratio de couverture Reserve/Supply en temps réel
- Visualisation comparative
- Alertes en cas de déséquilibre

#### 🔗 API / Webhooks
- Configuration des endpoints
- Monitoring des messages reçus
- Gestion des transactions

#### 💰 Fees Management
- Analyse des frais par opérateur
- Statistiques de coûts

**+ Toutes les fonctionnalités Stablecoin Studio** :
- Création de stablecoins
- Gestion des rôles et permissions
- Opérations : Cash-in, Burn, Wipe, Freeze, KYC
- Support multisignature

👉 [Documentation de la web app](./web/README.md)

---

## 🏛️ Basé sur Hedera Stablecoin Studio

**Important** : NiaSync est construit sur la base solide de [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) développé par l'équipe Hedera.

### Ce qui vient de Stablecoin Studio (94.9% du code - 75 834 lignes)

✅ **Smart Contracts** : Architecture Diamond Pattern, gestion des tokens Hedera  
✅ **SDK** : API TypeScript complète pour interagir avec les smart contracts (40% du projet)  
✅ **CLI** : Interface en ligne de commande (17% du projet)  
✅ **Backend de base** : NestJS, coordination multisignature  
✅ **Web app de base** : React, création de stablecoins, gestion des rôles  

**Fonctionnalités héritées** :
- Système de rôles multiples (Admin, Cash-in, Burn, Wipe, etc.)
- Support natif Hedera Token Service (HTS)
- Preuves de réserve (Chainlink compatible)
- Multisignature Hedera natif
- Support multi-wallet (HashPack, Blade, MetaMask)

👉 [Documentation officielle Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio)

---

## ⭐ Ce qui a été ajouté par NiaSync (5.1% du code - 4 077 lignes)

### Nouveaux modules complets

| Module | Description | Fichiers |
|--------|-------------|----------|
| 📱 **Mobile App** | Application Flutter pour capture SMS | `mobile-app/*` |
| 📊 **Mobile Money Management** | Analyse des transactions MM | `web/src/views/MobileMoneyManagement/` |
| 📈 **Analytics** | Coverage ratio Reserve/Supply | `web/src/views/Analytics/` |
| 🔗 **Webhooks** | Réception des SMS de l'app mobile | `backend/src/webhook/`, `web/src/views/API/` |
| 💰 **Fees Management** | Analyse des frais par opérateur | `web/src/views/FeesManagement/` |

### Nouvelles librairies

| Fonctionnalité | Librairies |
|----------------|------------|
| Graphiques interactifs | `plotly.js-basic-dist`, `react-plotly.js`, `recharts` |
| Traitement de données | `csv-parse`, `date-fns` |
| Application mobile | Flutter 3.0+, `telephony`, `flutter_foreground_task` |

### API ajoutées

```typescript
// Nouveaux endpoints backend
POST   /webhook/messages           // Recevoir SMS de l'app mobile
GET    /webhook/messages           // Récupérer les transactions
DELETE /webhook/messages           // Supprimer des transactions
PUT    /webhook/messages/reclassify // Reclassifier
```

---

## 🏗️ Architecture globale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    📱 SMARTPHONE (Android/iOS)               │
│                                                              │
│   SMS: "Transfert Orange Money 50000 AR réussi..."         │
│                           ↓                                  │
│              📱 NiaSync Mobile App (Flutter)                │
│              - Filtre SMS mobile money                       │
│              - Stocke localement                             │
│              - Service arrière-plan 24/7                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS POST /webhook/messages
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              🔄 BACKEND API (NestJS + PostgreSQL)            │
│                                                              │
│   - Reçoit les webhooks de l'app mobile                    │
│   - Stocke les transactions en base de données              │
│   - Calcule les réserves totales                            │
│   - Coordonne les transactions multisig                     │
│   - Expose les données via REST API                         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP GET/POST
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                🌐 WEB DAPP (React + TypeScript)              │
│                                                              │
│   Modules NiaSync:                  Modules Stablecoin:     │
│   ├─ 📊 Mobile Money Management    ├─ Create Stablecoin    │
│   ├─ 📈 Analytics (Reserve/Supply) ├─ Operations           │
│   ├─ 🔗 Webhooks Management        ├─ Roles Management     │
│   └─ 💰 Fees Analysis              └─ Settings             │
└────────────────────────┬────────────────────────────────────┘
                         │ Smart Contract Calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           ⛓️  HEDERA HASHGRAPH BLOCKCHAIN                    │
│                                                              │
│   📜 Smart Contracts (Solidity - Diamond Pattern)           │
│   - Stablecoin avec preuve de réserve MM                    │
│   - Mint contrôlé par réserve mobile money                  │
│   - Système de rôles granulaire                             │
│   - Support multisignature natif Hedera                     │
│                                                              │
│   💰 Hedera Token Service (HTS)                             │
│   - Tokens natifs Hedera                                    │
│   - Frais de transaction très bas                           │
└─────────────────────────────────────────────────────────────┘
```

### Structure du projet

```
📁 NiaSync
│
├── 📱 mobile-app/                    ⭐ NOUVEAU - App mobile Flutter
│   ├── android/                      # Build Android
│   ├── ios/                          # Build iOS
│   ├── lib/
│   │   ├── background/               # Service arrière-plan SMS
│   │   ├── screens/                  # UI (home, historique)
│   │   ├── services/                 # API communication
│   │   └── main.dart
│   └── pubspec.yaml                  # Dépendances Flutter
│
├── 🔄 backend/                       ← Studio + ajouts NiaSync
│   ├── src/
│   │   ├── transactions/             ← Stablecoin Studio (original)
│   │   ├── jobs/                     ← Stablecoin Studio (original)
│   │   └── webhook/                  ⭐ NOUVEAU - Réception SMS
│   └── package.json
│
├── 🌐 web/                           ← Studio + ajouts NiaSync
│   ├── src/views/
│   │   ├── StableCoinCreation/       ← Stablecoin Studio
│   │   ├── Operations/               ← Stablecoin Studio
│   │   ├── Roles/                    ← Stablecoin Studio
│   │   ├── Settings/                 ← Stablecoin Studio
│   │   ├── MobileMoneyManagement/    ⭐ NOUVEAU - Gestion MM
│   │   ├── Analytics/                ⭐ NOUVEAU - Coverage ratio
│   │   ├── API/                      ⭐ NOUVEAU - Webhooks UI
│   │   └── FeesManagement/           ⭐ NOUVEAU - Analyse frais
│   └── src/utils/
│       ├── csvProcessor.ts           ⭐ NOUVEAU
│       ├── mobileMoneyUtils.ts       ⭐ NOUVEAU
│       └── webhookDataAdapter.ts     ⭐ NOUVEAU
│
├── 📜 contracts/                     ← Stablecoin Studio (inchangé)
│   └── Smart contracts Solidity
│
├── 📦 sdk/                           ← Stablecoin Studio (inchangé)
│   └── TypeScript SDK
│
└── 🖥️ cli/                           ← Stablecoin Studio (inchangé)
    └── Command Line Interface
```

---

## 💻 Technologies

### Stack technique complet

| Couche | Technologies |
|--------|--------------|
| **Blockchain** | Hedera Hashgraph, Hedera Token Service (HTS) |
| **Smart Contracts** | Solidity 0.8.16, Hardhat, Diamond Pattern (EIP-2535) |
| **Backend** | NestJS, TypeScript, PostgreSQL, TypeORM |
| **Web Frontend** | React 18, TypeScript, Chakra UI, Redux |
| **Mobile** | Flutter 3.0+, Dart |
| **Graphiques** | Plotly.js, React-Plotly.js, Recharts |
| **Data Processing** | csv-parse, date-fns |
| **Wallets** | HashPack, Blade, MetaMask |

---

## 📦 Installation

### Prérequis

- **Node.js** ≥ 18.13
- **PostgreSQL** (pour le backend)
- **Flutter** ≥ 3.0 (pour l'app mobile)
- **Compte Hedera** (testnet ou mainnet)

### Installation complète (Backend + Web)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-repo/niasync.git
cd niasync

# 2. Installer toutes les dépendances
npm run install:all

# 3. Configurer les variables d'environnement
# Créer les fichiers .env dans backend/ et web/

# 4. Démarrer le backend
cd backend
npm run start:dev

# 5. Démarrer le frontend (nouveau terminal)
cd web
npm start
```

### Installation de l'app mobile

```bash
# 1. Installer Flutter
# Suivre : https://flutter.dev/docs/get-started/install

# 2. Installer les dépendances
cd mobile-app
flutter pub get

# 3. Lancer sur émulateur ou téléphone
flutter run

# 4. Ou build APK
flutter build apk --release
```

---

## 🎮 Démarrage rapide

### Scénario complet : De la capture SMS à la tokenisation

#### Étape 1 : Configurer l'app mobile 📱

1. Installer l'app mobile sur votre téléphone Android/iOS
2. Ouvrir l'app et configurer :
   - URL du backend : `https://votre-backend.com`
   - Votre numéro de téléphone
3. Autoriser les permissions SMS
4. L'app commence à capturer les SMS automatiquement

#### Étape 2 : Vérifier la réception 🔄

1. Ouvrir la web app : `http://localhost:5000`
2. Aller dans **"API / Webhooks"**
3. Voir les SMS mobile money capturés en temps réel

#### Étape 3 : Analyser vos flux 📊

1. Aller dans **"Mobile Money Management"**
2. Voir vos graphiques :
   - Balance dans le temps
   - Entrées/sorties
   - Types de transactions
3. Votre réserve totale est calculée automatiquement

#### Étape 4 : Créer votre stablecoin ⛓️

1. Aller dans **"Create Stablecoin"**
2. Choisir **"Link to Proof of Reserve"**
3. Sélectionner **"Mobile Money Reserve"**
4. Déployer votre stablecoin !

#### Étape 5 : Visualiser le coverage 📈

1. Aller dans **"Analytics"**
2. Voir en temps réel :
   - Total Supply de votre stablecoin
   - Réserve mobile money
   - Coverage Ratio (%)

🎉 **Votre mobile money est maintenant tokenisé sur blockchain !**

---

## 📖 Utilisation

### Pour les institutions financières

**Use case** : Émettre des stablecoins adossés à vos réserves mobile money

1. Déployez l'app mobile sur les téléphones de vos agents
2. Capturez automatiquement toutes les transactions
3. Créez un stablecoin avec preuve de réserve publique
4. Offrez des services DeFi à vos clients

### Pour les entreprises

**Use case** : Gérer votre trésorerie mobile money

1. Connectez tous vos comptes mobile money via l'app
2. Visualisez vos flux en temps réel
3. Analysez vos frais par opérateur
4. Générez des rapports automatiques

### Pour les développeurs

**Use case** : Intégrer NiaSync dans votre application

```typescript
// Utiliser le SDK
import { NiaSyncSDK } from '@niasync/sdk';

const sdk = new NiaSyncSDK({
  backendUrl: 'https://api.niasync.com',
  apiKey: 'your-api-key'
});

// Récupérer les transactions mobile money
const transactions = await sdk.getTransactions();

// Vérifier la réserve
const reserve = await sdk.getReserve();

// Créer un stablecoin
const stablecoin = await sdk.createStablecoin({
  name: 'MyStablecoin',
  symbol: 'MSC',
  linkedToReserve: true
});
```

---

## 📚 Documentation

### Documentation par module

| Module | Documentation |
|--------|---------------|
| 📱 **App Mobile** | [mobile-app/README.md](./mobile-app/README.md) |
| 🔄 **Backend** | [backend/README.md](./backend/README.md) |
| 🌐 **Web App** | [web/README.md](./web/README.md) |
| 📜 **Smart Contracts** | [contracts/README.md](./contracts/README.md) |
| 📦 **SDK** | [sdk/README.md](./sdk/README.md) |
| 🖥️ **CLI** | [cli/README.md](./cli/README.md) |

### Guides spécifiques

- **Installation Flutter** : [Flutter.dev](https://flutter.dev/docs/get-started/install)
- **Configuration webhooks** : Voir [mobile-app/README.md](./mobile-app/README.md)
- **Format CSV mobile money** : Voir [web/README.md](./web/README.md)
- **Déploiement** : Voir les README de chaque module

### Ressources externes

- [Documentation Hedera](https://docs.hedera.com)
- [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio)
- [Flutter Documentation](https://flutter.dev/docs)

---

## 🔐 Sécurité

- ✅ **Smart contracts audités** par Certik ([Rapport](./Certik%20final%20smart%20contracts%20audit%20report.pdf))
- ✅ **Multisignature** : Support natif Hedera multi-key
- ✅ **RBAC** : Contrôle d'accès basé sur les rôles
- ✅ **Chiffrement** : Communications HTTPS
- ✅ **Permissions** : App mobile avec filtrage des SMS

**Rapporter une vulnérabilité** : Consultez [SECURITY.md](./SECURITY.md)

---

## 💬 Support

- 📖 **Documentation** : Voir les README de chaque module
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-repo/niasync/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/votre-repo/niasync/discussions)
- 📧 **Email** : support@niasync.io *(exemple)*

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

Consultez notre [guide de contribution](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md).

### Code de conduite

[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md)

---

## 🙏 Crédits

### Hedera Stablecoin Studio

Ce projet est basé sur [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) développé par l'équipe Hedera Hashgraph.

**Merci à l'équipe Hedera pour** :
- L'architecture complète des smart contracts
- Le SDK, CLI, Backend et Web app de base
- Le système de rôles et multisignature
- L'intégration Hedera Token Service
- La documentation et les tests

### NiaSync

**Contributions de l'équipe NiaSync** :
- 📱 Application mobile Flutter pour capture SMS
- 📊 Module Mobile Money Management
- 📈 Module Analytics (Coverage ratio)
- 🔗 Système de webhooks pour l'app mobile
- 💰 Module Fees Management
- 🛠️ Utilitaires de traitement CSV et mobile money

### Open Source

Merci aux projets open source utilisés :
- Flutter & Dart
- React & TypeScript
- NestJS
- Plotly.js
- Et toutes les autres librairies

---

## 📊 Statistiques du projet

### Répartition du code (calcul précis)

| Composant | Lignes de code | Pourcentage |
|-----------|----------------|-------------|
| **Backend** (Stablecoin Studio) | 1 862 | 2.3% |
| **Backend Webhooks** (NiaSync) | 438 | 0.5% |
| **Web** (Stablecoin Studio) | 18 872 | 23.6% |
| **Web - Nouveaux modules** (NiaSync) | 2 393 | 3.0% |
| **Contracts** (Stablecoin Studio) | 6 693 | 8.4% |
| **SDK** (Stablecoin Studio) | 31 984 | 40.0% |
| **CLI** (Stablecoin Studio) | 13 592 | 17.0% |
| **Mobile App** (NiaSync) | 1 253 | 1.6% |
| **TOTAL** | **79 911** | **100%** |

### Résumé

| Métrique | Valeur |
|----------|--------|
| **Code de base (Stablecoin Studio)** | 75 834 lignes (94.9%) |
| **Ajouts NiaSync** | 4 077 lignes (5.1%) |
| **Modules totaux** | 3 (Mobile + Backend + Web) |
| **Nouveaux modules web** | 4 (MM Management, Analytics, API, Fees) |
| **Nouveau module mobile** | 1 (App Flutter complète) |
| **Technologies ajoutées** | 8 (Flutter, Plotly, csv-parse, etc.) |

**Conclusion** : NiaSync ajoute ~5% de code nouveau qui transforme Stablecoin Studio en solution complète de tokenisation du mobile money avec capture automatique des SMS.

---

## 📄 Licence

[Apache License 2.0](LICENSE)

---

## 🌟 Roadmap

### Version actuelle (v1.0)
- ✅ App mobile Android/iOS
- ✅ Backend webhooks
- ✅ Mobile Money Management
- ✅ Analytics & Coverage ratio
- ✅ Fees Management

### Prochaines versions

**v1.1** (Q1 2026)
- [ ] Support de plus d'opérateurs africains
- [ ] Notifications push dans l'app mobile
- [ ] Export PDF des rapports
- [ ] API publique pour développeurs

**v1.2** (Q2 2026)
- [ ] Application mobile native améliorée
- [ ] Intégration API directe avec opérateurs
- [ ] Module de réconciliation comptable
- [ ] Dashboard admin avancé

**v2.0** (Q3 2026)
- [ ] Support paiements marchands
- [ ] Bridge vers d'autres blockchains
- [ ] Marketplace de stablecoins MM
- [ ] SDK mobile pour développeurs

---

<div align="center">

**[⬆ Retour en haut](#-niasync)**

---

Construit avec ❤️ pour démocratiser l'accès à la blockchain en Afrique

Basé sur [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) | Propulsé par [Hedera Hashgraph](https://hedera.com)

---

**NiaSync** = **Nia** (objectif en swahili) + **Sync** (synchronisation)

*Notre objectif : synchroniser le mobile money avec la blockchain*

</div>
