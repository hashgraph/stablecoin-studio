<div align="center">

# 💳 NiaSync

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

**Plateforme de gestion et tokenisation du Mobile Money sur blockchain Hedera**

*Transformez vos réserves mobile money en stablecoins transparents et traçables*

[Documentation](#documentation) • [Installation](#installation) • [Démarrage](#démarrage-rapide) • [Architecture](#architecture)

</div>

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Pourquoi NiaSync ?](#pourquoi-niasync)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Utilisation](#utilisation)
- [Build](#build)
- [Support](#support)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## 🎯 Vue d'ensemble

**NiaSync** est une plateforme innovante qui permet de créer des **stablecoins adossés aux réserves de Mobile Money** sur la blockchain Hedera. Elle offre une solution complète pour digitaliser, tracer et gérer les transactions de mobile money (Orange Money, MVola, Airtel Money, etc.) tout en maintenant une transparence totale grâce à la technologie blockchain.

### Le problème résolu

En Afrique et dans les marchés émergents, le mobile money est omniprésent mais présente des défis :
- ❌ Manque de transparence sur les réserves
- ❌ Difficultés d'interopérabilité entre opérateurs
- ❌ Frais élevés pour les transferts
- ❌ Traçabilité limitée des transactions
- ❌ Pas d'accès aux services financiers décentralisés (DeFi)

### La solution NiaSync

✅ **Tokenisation** : Convertissez vos réserves mobile money en stablecoins blockchain  
✅ **Transparence** : Preuve de réserve en temps réel visible publiquement  
✅ **Analyse avancée** : Visualisation et analyse de vos flux mobile money  
✅ **Traçabilité** : Chaque transaction enregistrée sur la blockchain  
✅ **Interopérabilité** : Un token unique pour tous les opérateurs mobile money  
✅ **DeFi Ready** : Accès aux services financiers décentralisés

---

## 💡 Pourquoi NiaSync ?

### Pour les institutions financières

- **Conformité réglementaire** : Preuve de réserve automatique et auditable
- **Réduction des coûts** : Moins d'intermédiaires, frais réduits
- **Innovation** : Offrez des services blockchain à vos clients
- **Sécurité** : Multisignature et contrôle d'accès granulaire

### Pour les entreprises

- **Gestion de trésorerie** : Visualisez tous vos flux mobile money
- **Analytics avancés** : Graphiques et statistiques en temps réel
- **Automatisation** : Webhooks pour synchronisation automatique
- **Reporting** : Génération de rapports automatiques

### Pour les développeurs

- **SDK complet** : API TypeScript intuitive
- **Multi-wallet** : Support HashPack, Blade, MetaMask
- **Webhooks** : Intégration facile avec vos systèmes existants
- **Open source** : Code 100% ouvert et auditable

---

## 🚀 Fonctionnalités principales

### 1. 📊 Gestion Mobile Money

Module complet pour gérer vos transactions mobile money :

- **Import automatique** via webhooks (Orange Money, MVola, etc.)
- **Import CSV** : Téléversez vos relevés de transactions
- **Analyse en temps réel** : Visualisation graphique des flux
- **Statistiques détaillées** :
  - Solde courant
  - Entrées/sorties quotidiennes
  - Distribution par type de transaction
  - Matrice de corrélation des flux
  - Historique des transactions

### 2. 📈 Analytics & Reporting

Tableau de bord analytique avancé :

- **Coverage Ratio** : Ratio de couverture réserve/stablecoin en temps réel
- **Supply vs Reserve** : Visualisation comparative
- **Graphiques interactifs** : Plotly.js pour des analyses poussées
- **Statistiques multi-temporelles** : Jour, semaine, mois
- **Alertes** : Notifications en cas de déséquilibre

### 3. 💰 Stablecoin Management

Création et gestion de stablecoins adossés au mobile money :

- **Déploiement en un clic** : Créez votre stablecoin en quelques minutes
- **Multi-rôles** : Admin, Cash-in, Burn, Wipe, Rescue, etc.
- **Preuve de réserve** : Lien automatique avec votre solde mobile money
- **Cash-in intelligent** : Mint uniquement si la réserve le permet
- **Burn sécurisé** : Destruction de tokens avec mise à jour de réserve

### 4. 🔐 Sécurité avancée

- **Multisignature native** : Support complet des comptes multi-signatures Hedera
- **Contrôle d'accès** : Système de rôles granulaire (RBAC)
- **Audit trail** : Toutes les opérations tracées sur blockchain
- **Backend sécurisé** : API REST pour coordination multisig

### 5. 🔗 Intégrations

- **Webhooks** : Réception automatique des notifications mobile money
- **API REST** : Intégration facile avec vos systèmes
- **Multi-wallet** : HashPack, Blade, MetaMask
- **Export de données** : CSV, JSON

---

## 🏗️ Architecture

### Structure du projet

```
📁 NiaSync
├── 📂 contracts/          # Smart contracts Solidity
├── 📂 backend/            # API REST NestJS + PostgreSQL
│   ├── Multisig coordination
│   ├── Webhook management
│   └── Transaction storage
├── 📂 sdk/                # SDK TypeScript
│   └── API unifiée pour tous les modules
├── 📂 cli/                # Interface en ligne de commande
└── 📂 web/                # Application web React
    ├── MobileMoneyManagement/    ⭐ Nouveau
    ├── Analytics/                ⭐ Nouveau
    ├── FeesManagement/           ⭐ Nouveau
    ├── API/                      ⭐ Nouveau (Webhooks)
    └── ... (autres modules standard)
```

### Flux de données NiaSync

```
┌─────────────────────────────────────────────────┐
│         Sources de données Mobile Money         │
│  (Orange Money, MVola, Airtel Money, etc.)      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Webhooks / CSV Import              │
│          (Notifications SMS → Backend)          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Backend NiaSync (PostgreSQL)          │
│   • Stockage des transactions                   │
│   • Calcul des réserves                         │
│   • Coordination multisig                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            Frontend Web / CLI / SDK             │
│   • Visualisation Analytics                     │
│   • Gestion stablecoin                          │
│   • Proof of Reserve                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Smart Contracts (Hedera Network)         │
│   • Stablecoin avec preuve de réserve           │
│   • Minting contrôlé par réserve MM             │
│   • Multisignature support                      │
└─────────────────────────────────────────────────┘
```

### Modules NiaSync spécifiques

| Module | Fonction | Fichiers clés |
|--------|----------|---------------|
| **Mobile Money Management** | Import et analyse des transactions MM | `web/src/views/MobileMoneyManagement/` |
| **Analytics** | Visualisation Supply vs Reserve | `web/src/views/Analytics/` |
| **Fees Management** | Gestion des frais de transaction | `web/src/views/FeesManagement/` |
| **Webhook API** | Réception auto des notifications MM | `web/src/views/API/` + `backend/webhook` |
| **CSV Processor** | Traitement des relevés MM | `web/src/utils/csvProcessor.ts` |

---

## 💻 Technologies

| Composant | Stack technique |
|-----------|-----------------|
| **Blockchain** | Hedera Hashgraph (HTS) |
| **Smart Contracts** | Solidity 0.8.16, Hardhat |
| **Backend** | NestJS, TypeScript, PostgreSQL |
| **Frontend** | React 18, TypeScript, Chakra UI |
| **SDK** | TypeScript ≥4.7, Node.js ≥18.13 |
| **Analytics** | Plotly.js, Recharts |
| **Data Processing** | csv-parse, date-fns |
| **Wallet Support** | HashPack, Blade, MetaMask |

---

## 📦 Installation

### Prérequis

- **Node.js** ≥ 18.13
- **PostgreSQL** (pour le backend)
- **Compte Hedera** (testnet ou mainnet)
- **Git**

### Installation complète

```bash
# Cloner le projet
git clone https://github.com/votre-repo/niasync.git
cd niasync

# Installer toutes les dépendances
npm run install:all
```

Cette commande installe automatiquement tous les modules (backend, contracts, sdk, cli, web).

---

## 🎮 Démarrage rapide

### 1. Configuration des variables d'environnement

Créez un fichier `.env` dans chaque module :

**Backend** (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/niasync
PORT=3000
```

**Frontend** (`web/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_NETWORK=testnet
```

**SDK/CLI** (`.env` à la racine)
```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
NETWORK=testnet
```

### 2. Démarrer le backend

```bash
cd backend
npm run start:dev
```

Le backend démarre sur `http://localhost:3000`.

### 3. Démarrer le frontend

```bash
cd web
npm start
```

L'application web démarre sur `http://localhost:5000`.

### 4. Premier usage

1. **Connectez votre wallet** (HashPack, Blade ou MetaMask)
2. **Créez un stablecoin** adossé au mobile money
3. **Allez dans "API / Webhooks"** pour configurer la réception automatique
4. **Ou importez un CSV** de transactions mobile money
5. **Consultez "Analytics"** pour voir votre coverage ratio
6. **Utilisez "Mobile Money Management"** pour analyser vos flux

---

## 📖 Utilisation

### Import de transactions mobile money

#### Option 1 : Via webhooks (automatique)

1. Configurez votre endpoint webhook dans `API / Webhooks`
2. Configurez votre opérateur mobile money pour envoyer les notifications SMS vers le webhook
3. Les transactions sont automatiquement importées et analysées

#### Option 2 : Via CSV (manuel)

1. Exportez vos transactions depuis votre compte mobile money
2. Allez dans "Mobile Money Management"
3. Cliquez sur "Upload CSV"
4. Sélectionnez votre fichier (format : timestamp, provider, date, time, message)

### Création d'un stablecoin adossé au mobile money

1. **Importer d'abord vos transactions** mobile money
2. Aller dans "Create Stablecoin"
3. Choisir "Link to Proof of Reserve"
4. Sélectionner "Mobile Money Reserve" comme source
5. Le smart contract vérifiera automatiquement que vous avez assez de réserve avant chaque mint

### Analyse et monitoring

- **Mobile Money Management** : Vue complète des flux avec graphiques interactifs
- **Analytics** : Suivi du ratio de couverture Reserve/Supply en temps réel
- **Fees Management** : Analyse des frais par opérateur et type de transaction

---

## 🔨 Build

Pour compiler les modules après modification :

```bash
# Build complet (tous les modules dans l'ordre)
npm run build:contracts  # 1. Smart contracts
npm run build:sdk        # 2. SDK
npm run build:cli        # 3. CLI
npm run build:web        # 4. Frontend

# Ou build individuel
cd [module]
npm run build
```

---

## 🧪 Tests

```bash
# Tests globaux
npm test

# Tests par module
cd backend && npm test
cd sdk && npm test
cd web && npm test
```

Couverture de code :
- **Backend/SDK/Web** : >70%
- **Smart Contracts** : 100% des méthodes publiques

---

## 📚 Documentation

### Modules détaillés

- **[Backend](./backend/README.md)** : API REST, webhooks, multisig
- **[Contracts](./contracts/README.md)** : Smart contracts stablecoin
- **[SDK](./sdk/README.md)** : API programmatique TypeScript
- **[CLI](./cli/README.md)** : Interface en ligne de commande
- **[Web](./web/README.md)** : Application web React

### Guides

- **[Guide de déploiement](./docs/deployment.md)** *(à venir)*
- **[Configuration des webhooks](./docs/webhooks.md)** *(à venir)*
- **[Format CSV mobile money](./docs/csv-format.md)** *(à venir)*

---

## 🌍 Cas d'usage

### 1. Institution de microfinance

> *"Nous utilisons NiaSync pour tokeniser les dépôts mobile money de nos clients et leur offrir un accès à la DeFi tout en maintenant une preuve de réserve transparente."*

### 2. Entreprise de commerce électronique

> *"NiaSync nous permet de gérer nos recettes mobile money de tous les opérateurs en un seul endroit, avec des analytics puissants."*

### 3. Projet d'inclusion financière

> *"Grâce à NiaSync, nous créons des stablecoins communautaires adossés aux réserves mobile money locales, favorisant l'accès aux services financiers."*

---

## 🔐 Sécurité

- ✅ **Audité** : Smart contracts audités par Certik ([Rapport](./Certik%20final%20smart%20contracts%20audit%20report.pdf))
- ✅ **Multisignature** : Support natif Hedera multi-key
- ✅ **RBAC** : Contrôle d'accès basé sur les rôles
- ✅ **Audit trail** : Toutes les opérations tracées

**Pour rapporter une vulnérabilité** : Consultez [SECURITY.md](./SECURITY.md)

---

## 💬 Support

- 📧 Email : support@niasync.io *(exemple)*
- 💬 Discord : [Rejoindre la communauté](#) *(exemple)*
- 📖 Documentation : [docs.niasync.io](#) *(exemple)*
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/niasync/issues)

Pour les questions générales : [Guide de support](https://github.com/hashgraph/.github/blob/main/SUPPORT.md)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

Consultez notre [guide de contribution](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md).

### Code de conduite

Respectez le [Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md).

---

## 📄 Licence

[Apache License 2.0](LICENSE)

---

## 🙏 Remerciements

NiaSync est construit sur la base de [Hedera Stablecoin Studio](https://github.com/hashgraph/stablecoin-studio) développé par l'équipe Hedera.

**Ajouts et fonctionnalités NiaSync** :
- 💳 Module Mobile Money Management
- 📊 Analytics Supply vs Reserve
- 🔗 Intégration Webhooks
- 📈 Visualisations avancées (Plotly.js)
- 💰 Gestion automatique des réserves

Merci à la communauté Hedera et à tous les contributeurs !

---

## 🌟 Roadmap

- [ ] Support de plus d'opérateurs mobile money africains
- [ ] Application mobile native (iOS/Android)
- [ ] Intégration API directe avec Orange Money, MVola
- [ ] Module de réconciliation comptable automatique
- [ ] Support des paiements marchands
- [ ] Bridge vers d'autres blockchains
- [ ] Marketplace de stablecoins mobile money

---

<div align="center">

**[⬆ Retour en haut](#-niasync)**

Fait avec ❤️ pour démocratiser l'accès à la blockchain en Afrique

*Propulsé par [Hedera Hashgraph](https://hedera.com)*

</div>
