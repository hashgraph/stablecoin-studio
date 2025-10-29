# Overview

The Stablecoin Studio is a comprehensive toolkit designed for the creation, management, and operation of stablecoins on the Hedera network. It provides a complete infrastructure including smart contracts, an SDK, CLI tools, a web interface, and backend services. This enables developers and users to deploy and manage stablecoins with advanced features such as multisignature support, role-based access control, and deep integration with the Hedera Token Service (HTS). The system is built with a modular architecture, utilizing the Diamond pattern for upgradeable smart contracts, and supports various stablecoin functionalities like minting, burning, freezing, KYC compliance, custom fees, and proof of reserve mechanisms.

The application now includes a welcome page accessible at the root path ("/") that provides an introduction to the system with messaging focused on mobile money on-chain solutions before users navigate to the main application.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## October 29, 2025
- **MetaMask Connection Fix**: Fixed network configuration issue preventing MetaMask from connecting
  - Changed MetaMask connection to use 'testnet' network instead of invalid '-' value
  - Now correctly uses Hedera testnet mirror node URLs for API calls
  - Resolves 404 errors and "invalid response from server" issues during wallet connection
- **Connect Wallet Button Added**: Implemented "Connect Wallet" button in topbar when no wallet is connected
  - Modified `TopbarRight.tsx` to display "Connect Wallet" button when user is not authenticated
  - Button appears in purple color matching the app's design theme
  - Added Redux state `showWalletConnectModal` to control modal visibility
  - Clicking the button triggers the wallet connection modal with provider selection (MetaMask, WalletConnect, MultiSig)
  - Modal now works on all pages including public routes
  - Ensures users always have a clear way to connect their wallet from any page
- **Wallet Disconnection Fix**: Resolved critical bug in SDK that caused "No Transaction Handler registered!" error when disconnecting wallet
  - Modified `Network.ts` disconnect method to gracefully handle cases where no Transaction Handler is registered
  - Added try-catch block to prevent unhandled promise rejections during disconnection
  - Rebuilt SDK and cleared webpack cache to ensure frontend uses updated version
  - Wallet disconnection now works smoothly without console errors
- **Navigation Fix**: Resolved navigation redirect issue where clicking "Entrer" button briefly showed target page before redirecting back to Welcome
  - Fixed automatic redirect in CoinDropdown component that was triggering on StableCoinNotSelected page
  - Added condition to prevent redirect when no stablecoin is selected (`selectedStableCoin` must be truthy)
  - Removed wildcard redirect route (`*`) that was causing routing conflicts
- **Welcome Page**: Added elegant landing page at root path ("/")
  - Dark gradient background with subtle grid pattern
  - Headline: "Mobile money on-chain, cash out anywhere."
  - Key message: Complete platform for stablecoins backed by mobile money reserves
  - "How it works" section with 3 interactive step cards:
    - Download the NiaSync app (scans mobile money balance in real time)
    - Open Stablecoin Studio (tokenizes mobile money into on-chain assets)
    - Use or trade your tokens (send, pay, or invest in DeFi)
  - Configured as standalone route without sidebar or authentication
  - "Get Started →" button navigates to stablecoin selection page (/stable-coin/not-selected)
- **Route Optimization**: Removed previous Stablecoin Studio landing page (/studio) to simplify navigation structure
- **Public Routes**: All public pages (Mobile Money Management, Analytics, NiaSync, StableCoinNotSelected) are accessible without authentication

# System Architecture

## Monorepo Structure

The project employs a workspace-based monorepo architecture consisting of five primary modules:
- **contracts**: Solidity smart contracts utilizing the Diamond pattern for stablecoin logic.
- **sdk**: A TypeScript SDK for programmatic access to stablecoin functionalities.
- **cli**: Command-line interface for stablecoin management.
- **backend**: A NestJS REST API coordinating multisignature transactions.
- **web**: A React-based web application for user-friendly stablecoin management.

## Smart Contract Architecture (Diamond Pattern)

The system uses the Diamond pattern (EIP-2535) for upgradeable, modular smart contracts, allowing for dynamic feature extension without redeployment. Key components include a `BusinessLogicResolver` for managing facet versions, a `ResolverProxy` for routing calls, and various `Facets` implementing specific functionalities (e.g., Burnable, Freezable, KYC).

## Hedera Integration

The project integrates with the Hedera network using the Hedera SDK and HTS precompiled contracts. This facilitates native token operations, conversion between Hedera account IDs and EVM addresses, and leverages Hedera mirror nodes for historical data. It also supports Hedera's native multisig via threshold keys.

## Backend Multisignature System

A PostgreSQL-backed backend system coordinates asynchronous signing of transactions requiring multiple signatures. It provides a REST API for managing transactions and includes a scheduled job to automatically submit fully-signed transactions, supporting both keylist and threshold key scenarios.

## SDK Design Pattern

The SDK provides a unified interface across different wallet types and signing methods through an abstract wallet interface and concrete implementations. It supports HashPack, Blade, MetaMask, and software wallets, employing a factory pattern for wallet creation and an adapter pattern for unified operations.

## Frontend Architecture

The frontend is built with React and TypeScript, utilizing Redux for global state management. It features multi-wallet support, real-time transaction status updates, internationalization, and a responsive design.

## Role-Based Access Control

Role-based access control is enforced at the smart contract level using Keccak256 hashes as role identifiers. This system defines roles such as Default Admin, Cash In, Burn, Wipe, Rescue, Pause/Freeze/KYC, enabling hierarchical role management through facets.

## Configuration Management

Environment-based configuration manages deployment across multiple networks (testnet, mainnet, previewnet) with network-specific endpoints, mnemonic/private key management, and factory/resolver address versioning.

# External Dependencies

## Blockchain Infrastructure

- **Hedera Network**: Core blockchain for token operations and smart contract execution.
- **Hedera Token Service (HTS)**: Native token creation and management.
- **Hedera Mirror Nodes**: For historical transaction data and account queries.
- **JSON-RPC Relay**: Provides an EVM-compatible interface to the Hedera network.

## Smart Contract Libraries

- **Hardhat**: Development environment and testing framework.
- **OpenZeppelin**: For upgradeable contract utilities and proxy patterns.
- **Hedera Smart Contracts**: Interfaces for HTS precompiled contracts.

## Backend Services

- **PostgreSQL**: Used for transaction and signature storage in multisig coordination.
- **NestJS**: REST API framework with TypeORM for database access.
- **Swagger/OpenAPI**: For API documentation.

## Frontend & SDK

- **Hedera SDK (@hashgraph/sdk)**: Provides core Hedera functionality.
- **Ethers.js**: For Ethereum-compatible contract interaction.
- **WalletConnect**: Wallet connection protocol.
- **Axios**: HTTP client for mirror node queries.

## Development & Build Tools

- **TypeScript**: Primary development language.
- **Jest**: Testing framework.
- **ESLint & Prettier**: For code quality and formatting.
- **Concurrently**: For parallel script execution.
- **Commitlint**: For conventional commit enforcement.

## External Integrations

- **Chainlink**: Optional integration for price feeds for proof of reserve.
- **OpenZeppelin Defender**: Optional for smart contract monitoring and automation.