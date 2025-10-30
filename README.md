<div align="center">

# NiaSync - Stablecoin Studio

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

**Une plateforme complète pour créer, gérer et opérer des stablecoins sur Hedera Hashgraph**

[Documentation](#documentation) • [Installation](#installation) • [Architecture](#architecture) • [Contribuer](#contributing)

</div>

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture du projet](#architecture-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Build](#build)
- [Documentation](#documentation)
- [Sécurité](#sécurité)
- [Support](#support)
- [Contribuer](#contributing)
- [Licence](#licence)

---

## 🎯 À propos

**NiaSync - Stablecoin Studio** est une solution complète qui permet aux développeurs de créer, gérer et opérer des stablecoins sur la blockchain Hedera Hashgraph. Le projet offre un ensemble d'outils incluant des smart contracts, un SDK, une interface en ligne de commande (CLI) et une application web décentralisée (DApp).

### Qu'est-ce qu'un stablecoin ?

Un stablecoin est une cryptomonnaie conçue pour maintenir une valeur stable par rapport à un actif spécifique (généralement une devise fiduciaire comme le dollar américain). Contrairement aux cryptomonnaies volatiles, les stablecoins offrent la stabilité nécessaire pour les transactions quotidiennes et le commerce électronique.

### Pourquoi NiaSync ?

- ✅ **Déploiement simplifié** : Créez des stablecoins en quelques minutes
- ✅ **Gestion granulaire** : Système de rôles multiples pour une gouvernance flexible
- ✅ **Multisignature** : Support natif des comptes multi-signatures pour une sécurité renforcée
- ✅ **Preuve de réserve** : Intégration de flux de données pour la transparence
- ✅ **Interface intuitive** : CLI et DApp pour tous les niveaux d'utilisateurs

---

## 🚀 Fonctionnalités principales

### 1. Gestion des rôles multiples

Contrairement aux tokens Hedera standards, les stablecoins créés avec NiaSync permettent d'assigner plusieurs comptes pour chaque opération :

- **Admin** : Gestion complète du stablecoin
- **Cash-in** : Création de nouveaux tokens (limité ou illimité)
- **Burn** : Destruction de tokens
- **Wipe** : Suppression de tokens d'un compte spécifique
- **Pause** : Suspension temporaire des transactions
- **Freeze** : Gel de comptes individuels
- **KYC** : Gestion de la vérification d'identité
- **Rescue** : Récupération de tokens et HBAR du contrat

### 2. Fonctionnalité Cash-in avancée

Le rôle cash-in permet de créer et assigner des tokens en une seule transaction, avec deux modes :

- **Illimité** : Création sans limite (jusqu'à la supply maximale)
- **Limité** : Quota personnalisé par compte

### 3. Preuve de réserve

Intégration de flux de données externes (compatible avec Chainlink) pour garantir que les tokens sont adossés à des réserves réelles.

### 4. Support multisignature

Gestion complète des comptes multi-signatures Hedera pour une gouvernance décentralisée et sécurisée.

---

## 🏗️ Architecture du projet

Le projet est organisé en 5 modules Node.js :

```
📁 NiaSync
├── 📂 contracts/     # Smart contracts Solidity
├── 📂 backend/       # API REST pour les transactions multisig
├── 📂 sdk/           # SDK TypeScript pour les développeurs
├── 📂 cli/           # Interface en ligne de commande
├── 📂 web/           # Application web React (DApp)
└── 📂 docs/          # Documentation complète
```

### Flux de données

```
┌─────────────┐
│    DApp     │ ◄─── Interface utilisateur (React)
│     ou      │
│     CLI     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     SDK     │ ◄─── API unifiée
└──────┬──────┘
       │
       ├──────────► 📦 Smart Contracts (Hedera)
       │
       └──────────► 🔐 Backend (Multisig)
```

### Modules détaillés

- **[Contracts](./contracts/README.md)** : Smart contracts implémentant la logique stablecoin
- **[Backend](./backend/README.md)** : Gestion des transactions multi-signatures
- **[SDK](./sdk/README.md)** : API TypeScript pour intégrer les stablecoins
- **[CLI](./cli/README.md)** : Outil en ligne de commande
- **[Web](./web/README.md)** : DApp React pour l'interface graphique

---

## 💻 Technologies utilisées

| Composant | Technologies |
|-----------|-------------|
| **Smart Contracts** | Solidity 0.8.16, Hardhat 2.14.0 |
| **SDK/Backend/CLI** | TypeScript ≥4.7, Node.js ≥18.13 |
| **Interface Web** | React.js ≥2.2.6 |
| **Blockchain** | Hedera Hashgraph |
| **Outils** | OpenZeppelin, Chainlink (compatibilité) |

---

## 📦 Installation

### Prérequis

- Node.js ≥ 18.13
- NPM ou Yarn
- Un compte Hedera (testnet ou mainnet)

### Installation globale

Installez toutes les dépendances pour tous les modules :

```bash
npm run install:all
```

Cette commande installe et configure automatiquement les dépendances pour tous les sous-projets.

### Installation individuelle

Pour installer un module spécifique :

```bash
cd [module]  # contracts, sdk, cli, web, ou backend
npm install
```

---

## 🎮 Démarrage rapide

### 1. Configuration

Créez un fichier `.env` dans chaque module avec vos identifiants Hedera :

```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e...
NETWORK=testnet
```

### 2. Lancement de l'application web

```bash
cd web
npm start
```

L'application sera accessible sur `http://localhost:5000`

### 3. Utilisation du CLI

```bash
cd cli
npm start
```

Suivez les instructions interactives pour créer et gérer vos stablecoins.

### 4. Démarrage du backend (optionnel - pour multisig)

```bash
cd backend
npm run start:dev
```

---

## 🔨 Build

Lors de modifications, recompilez les modules dans cet ordre :

```bash
# 1. Smart contracts
npm run build:contracts

# 2. SDK
npm run build:sdk

# 3. CLI ou Web
npm run build:cli
# ou
npm run build:web
```

Ou individuellement dans chaque module :

```bash
cd [module]
npm run build
```

---

## 📚 Documentation

### Concepts clés

#### Création de stablecoins

Chaque stablecoin déploie automatiquement :
- Un nouveau token Hedera (token sous-jacent)
- Un smart contract proxy (pour l'upgradabilité)
- Un smart contract proxy admin

#### Catégories de stablecoins

- **Stablecoins internes** : Créés par votre compte
- **Stablecoins importés** : Créés par d'autres comptes, mais où vous avez des rôles

#### Déploiement avec multisignature

1. Déployez avec un compte simple en assignant les rôles au compte multisig
2. Assignez le rôle admin au compte multisig
3. Retirez le rôle admin du compte simple
4. Importez le stablecoin avec le compte multisig

### Frais des opérations

| Opération | Coût approximatif | Gas |
|-----------|-------------------|-----|
| Cash-in | $0.01 | 101,497 |
| Burn | $0.005 | 60,356 |
| Wipe | $0.005 | 60,692 |
| Freeze/Unfreeze | $0.005 | ~56,262 |
| Grant/Revoke KYC | $0.005 | ~56,181 |

*Les frais sont sujets à modification et peuvent varier selon les caractéristiques de la transaction.*

### JSON-RPC Relays

Utilisez l'un de ces relays JSON-RPC communautaires :
- [Hashio](https://swirldslabs.com/hashio/)
- [Arkhia](https://www.arkhia.io/features/#api-services)
- [ValidationCloud](https://docs.validationcloud.io/v1/hedera/json-rpc-relay-api)

Ou configurez votre propre relay local en suivant les [instructions officielles](https://github.com/hashgraph/hedera-json-rpc-relay).

---

## 🛠️ Déploiement des factories

Pour déployer des stablecoins, les smart contracts `HederaTokenManager` et `StablecoinFactory` doivent être déployés sur le réseau.

### Adresses par défaut

Les adresses des factories pré-déployées sont disponibles dans :
- [FACTORY_VERSION.md](./FACTORY_VERSION.md)
- [RESOLVER_VERSION.md](./RESOLVER_VERSION.md)

### Déployer vos propres factories

Consultez la [documentation des contracts](./contracts/README.md#deploy-factory) pour les instructions détaillées.

---

## 🔄 Migration V1 vers V2

Les smart contracts V2 ne sont pas compatibles avec V1. 

Si vous avez des stablecoins déployés en V1, suivez la procédure de migration décrite dans [contracts/README.md](./contracts/README.md).

---

## 🧪 Tests et qualité

- **SDK/CLI/Web** : >70% de couverture de code
- **Smart Contracts** : 100% de couverture des méthodes publiques/externes

### Lancer les tests

```bash
# Tests globaux
npm test

# Tests par module
cd [module]
npm test
```

---

## 🏛️ Principes de développement

Le projet suit des pratiques de développement de niveau entreprise :

### Domain-Driven Design (DDD)
Création d'un langage partagé pour améliorer la communication et l'efficacité.

### Architecture hexagonale
Séparation claire entre logique métier et infrastructure pour une meilleure testabilité.

### CQS Pattern
Séparation des commandes (modifications d'état) et des requêtes (lectures).

---

## 🔐 Sécurité

**Ne déposez jamais de problème de sécurité publiquement.**

Consultez notre [politique de sécurité](./SECURITY.md) pour rapporter des vulnérabilités de manière responsable.

Un audit de sécurité complet a été réalisé par Certik. Consultez le rapport : [Certik Audit Report](./Certik%20final%20smart%20contracts%20audit%20report.pdf)

---

## 💬 Support

Besoin d'aide ? Consultez notre [guide de support](https://github.com/hashgraph/.github/blob/main/SUPPORT.md).

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md) pour commencer.

### Code de conduite

Ce projet respecte le [Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). 

Signalez tout comportement inacceptable à [oss@hedera.com](mailto:oss@hedera.com).

---

## 📄 Licence

[Apache License 2.0](LICENSE)

---

## 🙏 Remerciements

Développé avec ❤️ par l'équipe Hedera et la communauté open source.

Merci à tous les [contributeurs](https://github.com/hashgraph/stablecoin-studio/graphs/contributors) qui ont participé à ce projet !

---

<div align="center">

**[⬆ Retour en haut](#niasync---stablecoin-studio)**

Made with ❤️ for the Hedera community

</div>
