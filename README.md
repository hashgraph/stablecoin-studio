<div align="center">

# NiaSync

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

**Extension de Hedera Stablecoin Studio pour la gestion du Mobile Money**

[Documentation](#documentation) • [Installation](#installation) • [Ce qui a été ajouté](#-ajouts-niasync)

</div>

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Basé sur Hedera Stablecoin Studio](#basé-sur-hedera-stablecoin-studio)
- [Ajouts NiaSync](#-ajouts-niasync)
- [Architecture](#architecture)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Build](#build)
- [Documentation Stablecoin Studio](#documentation-stablecoin-studio)
- [Support](#support)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## 🎯 À propos

**NiaSync** est une extension du [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) qui ajoute des fonctionnalités spécifiques pour la **gestion et l'analyse des transactions Mobile Money** (Orange Money, MVola, Airtel Money, etc.).

Le projet conserve toutes les fonctionnalités du Stablecoin Studio d'origine et y ajoute des modules pour :
- Importer et analyser les transactions mobile money
- Visualiser la couverture des réserves mobile money vs stablecoins
- Gérer les webhooks pour la synchronisation automatique
- Analyser les flux financiers avec des graphiques avancés

---

## 🏛️ Basé sur Hedera Stablecoin Studio

Ce projet est une **extension** du [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) développé par l'équipe Hedera.

### Fonctionnalités héritées de Stablecoin Studio

Tout le code de base provient du Stablecoin Studio et inclut :

#### Smart Contracts
- Architecture Diamond Pattern (EIP-2535) pour l'upgradabilité
- Gestion complète des stablecoins sur Hedera
- Système de rôles multiples (Admin, Cash-in, Burn, Wipe, Rescue, etc.)
- Support natif des tokens Hedera (HTS)
- Intégration des preuves de réserve

#### SDK & Outils
- SDK TypeScript complet pour l'interaction avec les smart contracts
- CLI (Interface en ligne de commande)
- Backend NestJS pour la coordination des transactions multisignatures
- Support multi-wallet (HashPack, Blade, MetaMask)

#### Interface Web (DApp)
- Application React pour la gestion des stablecoins
- Création et déploiement de stablecoins
- Gestion des rôles et permissions
- Opérations : Cash-in, Burn, Wipe, Freeze, KYC
- Support multisignature complet

Pour plus de détails sur ces fonctionnalités, consultez la [documentation officielle du Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio).

---

## ⭐ Ajouts NiaSync

Voici les **nouvelles fonctionnalités** ajoutées spécifiquement par NiaSync :

### 1. 📊 Module Mobile Money Management
**Nouveau module** : `web/src/views/MobileMoneyManagement/`

Fonctionnalités :
- Import de transactions via CSV (relevés mobile money)
- Import automatique via webhooks
- Visualisation graphique des flux :
  - Balance dans le temps
  - Entrées/sorties quotidiennes
  - Distribution par type de transaction
  - Matrice de corrélation des flux
- Support multi-fréquence (jour, semaine, mois)

**Technologies ajoutées** :
- `plotly.js-basic-dist` : Graphiques interactifs
- `react-plotly.js` : Intégration React
- `csv-parse` : Parsing des fichiers CSV
- `date-fns` : Manipulation de dates

### 2. 📈 Module Analytics Supply vs Reserve
**Nouveau module** : `web/src/views/Analytics/`

Fonctionnalités :
- Calcul du ratio de couverture (Reserve / Total Supply)
- Visualisation comparative Reserve Mobile Money vs Total Supply
- Graphiques en temps réel
- Alertes en cas de déséquilibre

### 3. 🔗 Module Webhooks & API
**Nouveau module** : `web/src/views/API/`
**Backend étendu** : `backend/src/webhook/`

Fonctionnalités :
- Réception de webhooks pour notifications mobile money
- Stockage des transactions dans PostgreSQL
- API REST pour récupération des données
- Interface de gestion des messages webhook

**Nouveaux endpoints backend** :
```
POST   /webhook/messages     - Recevoir un webhook
GET    /webhook/messages     - Récupérer les transactions
DELETE /webhook/messages     - Supprimer des transactions
PUT    /webhook/messages/reclassify - Reclassifier des transactions
```

### 4. 💰 Module Fees Management
**Nouveau module** : `web/src/views/FeesManagement/`

Fonctionnalités :
- Analyse des frais par opérateur mobile money
- Visualisation des frais par type de transaction
- Statistiques de coûts

### 5. 📱 Application Mobile (Flutter)
**Nouveau module** : `mobile-app/`

Application mobile Android/iOS pour la capture automatique des SMS mobile money :

Fonctionnalités :
- Écoute automatique des SMS des opérateurs (Orange Money, MVola, etc.)
- Filtrage intelligent des notifications mobile money
- Envoi automatique vers le backend via webhooks
- Fonctionnement en arrière-plan 24/7
- Historique local des SMS capturés
- Support Android et iOS

**Technologies** :
- Flutter SDK 3.0+
- Packages : `telephony`, `http`, `flutter_foreground_task`, `workmanager`

👉 [Documentation complète de l'app mobile](./mobile-app/README.md)

### 6. 🛠️ Utilitaires et Helpers
**Nouveaux fichiers** :
- `web/src/utils/csvProcessor.ts` : Traitement des CSV mobile money
- `web/src/utils/mobileMoneyUtils.ts` : Utilitaires mobile money
- `web/src/utils/webhookDataAdapter.ts` : Adaptateur pour webhooks

### 6. 📦 Dépendances ajoutées

**Au niveau root** (`package.json`) :
```json
{
  "csv-parse": "^6.1.0",
  "date-fns": "^4.1.0",
  "plotly.js-basic-dist": "^3.1.1",
  "react-plotly.js": "^2.6.0",
  "recharts": "^3.2.1"
}
```

### Fichiers modifiés vs ajoutés

**Fichiers 100% nouveaux (NiaSync)** :
- `web/src/views/MobileMoneyManagement/*`
- `web/src/views/Analytics/*`
- `web/src/views/API/*`
- `web/src/views/FeesManagement/*`
- `web/src/utils/csvProcessor.ts`
- `web/src/utils/mobileMoneyUtils.ts`
- `web/src/utils/webhookDataAdapter.ts`
- `backend/src/webhook/*`
- `mobile-app/*` (Application Flutter complète)

**Fichiers existants (du Stablecoin Studio)** :
- Tous les autres fichiers sont issus du Stablecoin Studio original

---

## 🏗️ Architecture

```
📁 NiaSync (Fork de Stablecoin Studio)
│
├── 📂 contracts/          ← Stablecoin Studio (inchangé)
├── 📂 sdk/                ← Stablecoin Studio (inchangé)
├── 📂 cli/                ← Stablecoin Studio (inchangé)
│
├── 📂 backend/            ← Stablecoin Studio + ajouts NiaSync
│   ├── src/transactions/  ← Original
│   ├── src/jobs/          ← Original
│   └── src/webhook/       ⭐ NOUVEAU (NiaSync)
│
├── 📂 web/                ← Stablecoin Studio + ajouts NiaSync
│   ├── src/views/
│   │   ├── StableCoinCreation/    ← Original
│   │   ├── Operations/            ← Original
│   │   ├── Roles/                 ← Original
│   │   ├── Settings/              ← Original
│   │   ├── MobileMoneyManagement/ ⭐ NOUVEAU (NiaSync)
│   │   ├── Analytics/             ⭐ NOUVEAU (NiaSync)
│   │   ├── API/                   ⭐ NOUVEAU (NiaSync)
│   │   └── FeesManagement/        ⭐ NOUVEAU (NiaSync)
│   │
│   └── src/utils/
│       ├── csvProcessor.ts        ⭐ NOUVEAU (NiaSync)
│       ├── mobileMoneyUtils.ts    ⭐ NOUVEAU (NiaSync)
│       └── webhookDataAdapter.ts  ⭐ NOUVEAU (NiaSync)
│
└── 📂 mobile-app/         ⭐ NOUVEAU (NiaSync) - Application Flutter
    ├── android/           # Configuration Android
    ├── ios/              # Configuration iOS
    └── lib/              # Code Dart
        ├── background/   # Tâches en arrière-plan
        ├── screens/      # Interfaces utilisateur
        └── services/     # Communication API
```

---

## 💻 Technologies

### Technologies de base (Stablecoin Studio)

| Composant | Technologies |
|-----------|-------------|
| **Smart Contracts** | Solidity 0.8.16, Hardhat 2.14.0 |
| **SDK/Backend/CLI** | TypeScript ≥4.7, Node.js ≥18.13 |
| **Interface Web** | React.js ≥2.2.6 |
| **Blockchain** | Hedera Hashgraph |

### Technologies ajoutées (NiaSync)

| Fonctionnalité | Librairies ajoutées |
|----------------|---------------------|
| **Graphiques** | plotly.js-basic-dist, react-plotly.js, recharts |
| **Data Processing** | csv-parse, date-fns |
| **Backend** | NestJS (déjà présent), PostgreSQL pour webhooks |
| **Mobile App** | Flutter 3.0+, telephony, http, flutter_foreground_task |

---

## 📦 Installation

### Prérequis

- Node.js ≥ 18.13
- PostgreSQL (pour le backend)
- Compte Hedera (testnet ou mainnet)

### Installation complète

```bash
# Cloner le projet
git clone https://github.com/votre-repo/niasync.git
cd niasync

# Installer toutes les dépendances
npm run install:all
```

---

## 🎮 Démarrage rapide

### 1. Démarrer le backend

```bash
cd backend
npm run start:dev
```

### 2. Démarrer le frontend

```bash
cd web
npm start
```

### 3. Utiliser les nouvelles fonctionnalités NiaSync

1. **Mobile Money Management** : Allez dans le menu et uploadez un CSV de transactions ou configurez les webhooks
2. **Analytics** : Créez d'abord un stablecoin, puis consultez le ratio de couverture
3. **API / Webhooks** : Configurez l'endpoint pour recevoir les notifications mobile money

---

## 🔨 Build

```bash
# Build complet
npm run build:contracts
npm run build:sdk
npm run build:cli
npm run build:web
```

---

## 📚 Documentation Stablecoin Studio

Pour la documentation complète sur les fonctionnalités héritées de Stablecoin Studio :

### Vue d'ensemble du Stablecoin Studio

Le Stablecoin Studio est une solution complète pour créer et gérer des stablecoins sur Hedera :

- **Qu'est-ce qu'un stablecoin** : Token Hedera avec fonctionnalités avancées (rôles multiples, cash-in, etc.)
- **Création de stablecoins** : Via smart contracts Factory
- **Gestion des stablecoins** : Système de rôles granulaire
- **Opérations** : Cash-in, Burn, Wipe, Freeze, KYC
- **Proof of Reserve** : Intégration de flux de données externes
- **Multisignature** : Support natif Hedera multi-key

### Documentation des modules

- **[Contracts](./contracts/README.md)** : Smart contracts et architecture Diamond
- **[Backend](./backend/README.md)** : API REST et coordination multisig
- **[SDK](./sdk/README.md)** : API TypeScript pour développeurs
- **[CLI](./cli/README.md)** : Interface en ligne de commande
- **[Web](./web/README.md)** : Application web React

### Documentation officielle

Pour une documentation complète du Stablecoin Studio :
👉 [Hedera Stablecoin Studio - Documentation officielle](https://github.com/hashgraph/stablecoin-studio)

---

## 🔐 Sécurité

Smart contracts audités par Certik : [Rapport d'audit](./Certik%20final%20smart%20contracts%20audit%20report.pdf)

Pour rapporter une vulnérabilité : [SECURITY.md](./SECURITY.md)

---

## 💬 Support

Consultez le [guide de support Hedera](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

Consultez le [guide de contribution](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md).

### Code de conduite

[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md)

---

## 📄 Licence

[Apache License 2.0](LICENSE)

---

## 🙏 Crédits

### Hedera Stablecoin Studio

Ce projet est basé sur [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) développé par l'équipe Hedera Hashgraph.

**Crédits pour Stablecoin Studio** :
- Architecture complète smart contracts
- SDK, CLI, Backend, et Web app de base
- Système de rôles et multisignature
- Intégration Hedera Token Service
- Documentation et tests

### Contributions NiaSync

**Ajouts par l'équipe NiaSync** :
- Module Mobile Money Management avec visualisations
- Module Analytics Supply vs Reserve
- Intégration Webhooks pour notifications mobile money
- Module Fees Management
- Utilitaires de traitement CSV mobile money

---

## 📊 Résumé des changements

| Catégorie | Source | Ajouté par NiaSync |
|-----------|--------|-------------------|
| Smart Contracts | ✅ Stablecoin Studio | ❌ Aucun changement |
| SDK | ✅ Stablecoin Studio | ❌ Aucun changement |
| CLI | ✅ Stablecoin Studio | ❌ Aucun changement |
| Backend (base) | ✅ Stablecoin Studio | ✅ Module webhooks |
| Web (base) | ✅ Stablecoin Studio | ✅ 4 nouveaux modules |
| Dépendances | ✅ Stablecoin Studio | ✅ 5 librairies (graphiques, CSV) |

**Estimation** : ~85% du code vient de Stablecoin Studio, ~15% ajouté par NiaSync.

---

<div align="center">

**[⬆ Retour en haut](#niasync)**

Basé sur [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio)  
Extensions Mobile Money par l'équipe NiaSync

</div>
