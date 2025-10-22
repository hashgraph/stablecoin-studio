# Overview

The Stablecoin Studio is a comprehensive toolkit for creating, managing, and operating stablecoins on the Hedera network. The project provides a complete infrastructure including smart contracts, SDK, CLI tools, web interface, and backend services to enable developers and users to deploy and manage stablecoins with features like multisignature support, role-based access control, and integration with Hedera Token Service (HTS).

The system is built around a modular architecture using the Diamond pattern for upgradeable smart contracts, with support for various stablecoin features including minting, burning, freezing, KYC compliance, custom fees, and proof of reserve mechanisms.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## API Webhooks Page (October 22, 2025)

Created a new "API" page and backend endpoint to receive and display webhook messages in real-time.

**Backend Files Created**:
- `backend/src/webhook/webhook-message.entity.ts` - TypeORM entity for webhook messages table
- `backend/src/webhook/dto/create-webhook-message.dto.ts` - DTO for incoming webhooks
- `backend/src/webhook/dto/get-webhook-messages-response.dto.ts` - Response DTO
- `backend/src/webhook/webhook.service.ts` - Service for business logic
- `backend/src/webhook/webhook.controller.ts` - REST API controller
- `backend/src/webhook/webhook.module.ts` - NestJS module
- `backend/.env` - Environment configuration for database

**Frontend Files Created**:
- `web/src/views/API/index.tsx` - API page component with real-time message display

**Files Modified**:
- `backend/src/app.module.ts` - Added WebhookModule and WebhookMessage entity
- `web/src/Router/NamedRoutes.ts` - Added API route name
- `web/src/Router/RoutesMappingUrl.ts` - Added /api URL mapping
- `web/src/Router/Router.tsx` - Added API route in public zone
- `web/src/layout/sidebar/Sidebar.tsx` - Added API Webhooks button with Code icon
- `web/src/translations/en/global.json` - Added API translations

**Features**:
- **POST /webhook/messages** - Receives webhook messages with format:
  - Input: `{ id, message, sender, timestamp, sent }`
  - Stored as: `{ id, body, sender, timestamp, sent }` (message → body)
- **GET /webhook/messages** - Returns all stored messages (latest first)
- **DELETE /webhook/messages** - Clear all messages
- Real-time table displaying: ID, Body, Sender, Timestamp, Status, Received At
- Auto-refresh every 10 seconds
- Manual refresh button
- Webhook URL prominently displayed
- Responsive table with badges for sent status

**Technical Notes**:
- Backend uses NestJS with TypeORM
- PostgreSQL database (same as multisig transactions)
- API accessible at `http://localhost:3000/webhook/messages`
- Frontend fetches from `REACT_APP_BACKEND_URL` environment variable
- Swagger documentation available at `/api` when backend is running

**Starting the Backend**:
```bash
cd backend
npm install
npm run start:dev
```

Backend listens on port 3000 and connects to the PostgreSQL database configured in `.env`.

## Analytics Page (October 16, 2025)

Created a new "Analytics" page to visualize the relationship between stablecoin total supply and mobile money reserve balance.

**Files Created**:
- `web/src/views/Analytics/index.tsx` - Analytics page component with pie chart

**Files Modified**:
- `web/src/Router/NamedRoutes.ts` - Added Analytics route name
- `web/src/Router/RoutesMappingUrl.ts` - Added /analytics URL mapping
- `web/src/Router/Router.tsx` - Added Analytics route in public zone (no wallet connection required)
- `web/src/layout/sidebar/Sidebar.tsx` - Added Analytics button with ChartPie icon
- `web/src/translations/en/global.json` - Added analytics translations
- `web/src/views/MobileMoneyManagement/index.tsx` - Now stores last balance in localStorage for Analytics

**Features**:
- Pie chart comparing Total Supply (from selected stablecoin) vs Mobile Money Reserve (last balance from CSV)
- Three key statistics: Total Supply, Mobile Money Reserve, Coverage Ratio (%)
- Smart alerts:
  - Warning if no stablecoin selected → prompts to select one
  - Info if no CSV uploaded → prompts to upload in Mobile Money Management
  - Success if reserve ≥ total supply (fully collateralized)
  - Warning if reserve < total supply (under-collateralized)
- Plotly.js pie chart with interactive hover tooltips
- Accessible without wallet connection (public route)

**Data Flow**:
- Mobile Money Management stores last balance in `localStorage.mobileMoneyLastBalance`
- Analytics reads total supply from Redux (`SELECTED_WALLET_COIN`)
- Compares both values to calculate coverage ratio

## Mobile Money Management Feature (October 14, 2025)

Added a new "Mobile Money Management" section as a dedicated sidebar item for analyzing mobile money transaction data.

**Files Created**:
- `web/src/utils/mobileMoneyUtils.ts` - CSV parsing and transaction type definitions
- `web/src/utils/csvProcessor.ts` - Data analysis functions (activity analysis, daily flows, balance calculations)
- `web/src/views/MobileMoneyManagement/index.tsx` - Dedicated page component with CSV upload and interactive charts

**Files Modified**:
- `web/src/Router/NamedRoutes.ts` - Added MobileMoneyManagement route name
- `web/src/Router/RoutesMappingUrl.ts` - Added /mobile-money-management URL mapping
- `web/src/Router/Router.tsx` - Added MobileMoneyManagement route in public zone (no wallet connection required)
- `web/src/layout/sidebar/Sidebar.tsx` - Added Mobile Money Management button with ChartLine icon
- `web/src/translations/en/global.json` - Added sidebar and mobileMoney translations

**Features**:
- Dedicated sidebar button with ChartLine icon
- CSV file upload for mobile money transactions
- Frequency-based activity analysis (15min, 30min, 1H, 6H, 1D intervals)
- Three interactive Recharts visualizations:
  - Transaction activity over time
  - Daily cash flows (inflows vs outflows)
  - Balance evolution with 7-day moving average
- Statistics display (total slots, active slots, inactive slots)

**Technical Notes**:
- Uses native JavaScript date functions instead of date-fns library to avoid dependency conflicts
- Accessible without wallet connection for better UX
- Standalone page, not nested within Network settings

# System Architecture

## Monorepo Structure

The project uses a workspace-based monorepo architecture with five main modules:

- **contracts**: Solidity smart contracts implementing stablecoin logic using the Diamond pattern
- **sdk**: TypeScript SDK providing programmatic access to stablecoin functionality
- **cli**: Command-line interface for managing stablecoins
- **backend**: NestJS REST API for multisignature transaction coordination
- **web**: React-based web application for user-friendly stablecoin management

## Smart Contract Architecture (Diamond Pattern)

**Problem**: Need for upgradeable, modular smart contracts that can be extended with new features without redeployment

**Solution**: Diamond pattern (EIP-2535) with facet-based architecture and a resolver proxy system

**Key Components**:
- **BusinessLogicResolver**: Central registry managing facet versions and configurations
- **ResolverProxy**: Proxy contract routing calls to appropriate facet implementations
- **Facets**: Modular contracts implementing specific functionality (Burnable, Freezable, KYC, etc.)
- **TransparentUpgradeableProxy**: Upgradeable proxy for the resolver itself

**Rationale**: Allows dynamic feature addition, version management, and seamless upgrades without disrupting existing deployments

## Hedera Integration

**Problem**: Bridge Ethereum-style smart contracts with Hedera's unique token and account model

**Solution**: Integration layer using Hedera SDK and HTS precompiled contracts

**Key Aspects**:
- Uses Hedera Token Service (HTS) for native token operations
- Converts between Hedera account IDs and EVM addresses
- Integrates with Hedera mirror nodes for historical data
- Supports Hedera's native multisig through threshold keys

## Backend Multisignature System

**Problem**: Coordinate asynchronous signing of transactions requiring multiple signatures

**Solution**: PostgreSQL-backed transaction queue with scheduled submission

**Architecture**:
- REST API for adding, signing, and retrieving unsigned transactions
- Database stores transaction bytes and signature metadata
- Scheduled job automatically submits fully-signed transactions
- Supports keylist and threshold key scenarios

**Rationale**: Enables offline/async signing workflows where multiple parties must approve transactions

## SDK Design Pattern

**Problem**: Provide unified interface across different wallet types and signing methods

**Solution**: Abstract wallet interface with concrete implementations

**Supported Wallets**:
- HashPack (Hedera native)
- Blade (Hedera native)
- MetaMask (EVM-compatible)
- Software wallets (private key based)

**Design**: Factory pattern for wallet creation, adapter pattern for unified operations

## Frontend Architecture

**Framework**: React with TypeScript

**State Management**: Redux for global state, React hooks for local state

**Key Features**:
- Multi-wallet support with single active wallet paradigm
- Real-time transaction status updates
- Internationalization support (i18next)
- Responsive design for mobile/desktop

**Rationale**: React provides component reusability; Redux enables predictable state management for complex wallet interactions

## Role-Based Access Control

**Problem**: Different operations require different permission levels

**Solution**: Role system enforced at smart contract level

**Roles**:
- Default Admin (role management)
- Cash In (minting)
- Burn (burning tokens)
- Wipe (force token removal)
- Rescue (recover stuck tokens)
- Pause/Freeze/KYC (operational controls)

**Implementation**: Keccak256 hashes as role identifiers, hierarchical role management through facets

## Configuration Management

**Problem**: Manage deployment across multiple networks with different settings

**Solution**: Environment-based configuration system

- Network-specific endpoints (testnet, mainnet, previewnet)
- Mnemonic and private key management per network
- Factory and resolver address versioning
- Support for both Hardhat local and Hedera networks

# External Dependencies

## Blockchain Infrastructure

- **Hedera Network**: Primary blockchain for token operations and smart contract execution
- **Hedera Token Service (HTS)**: Native token creation and management
- **Hedera Mirror Nodes**: Historical transaction data and account queries
- **JSON-RPC Relay**: EVM-compatible interface to Hedera network

## Smart Contract Libraries

- **Hardhat**: Development environment and testing framework
- **OpenZeppelin**: Upgradeable contract utilities and proxy patterns
- **Hedera Smart Contracts**: HTS precompiled contract interfaces

## Backend Services

- **PostgreSQL**: Transaction and signature storage for multisig coordination
- **NestJS**: REST API framework with TypeORM for database access
- **Swagger/OpenAPI**: API documentation

## Frontend & SDK

- **Hedera SDK (@hashgraph/sdk)**: Core Hedera functionality
- **Ethers.js**: Ethereum-compatible contract interaction
- **WalletConnect**: Wallet connection protocol
- **Axios**: HTTP client for mirror node queries

## Development & Build Tools

- **TypeScript**: Primary development language
- **Jest**: Testing framework across all modules
- **ESLint & Prettier**: Code quality and formatting
- **Concurrently**: Parallel script execution
- **Commitlint**: Conventional commit enforcement

## External Integrations

- **Chainlink**: Price feed integration for proof of reserve (optional)
- **OpenZeppelin Defender**: Smart contract monitoring and automation (optional via defenders module)