---
id: configuration
title: "⚙️ Configuration & Manual Setup"
sidebar_label: "⚙️ Configuration & Manual Setup"
---

# ⚙️ Configuration & Manual Setup

The CLI needs to know which account to use and how to connect to the Hedera network. You can achieve this via the Accelerator Wizard or by manually creating the configuration files.

## 🪄 Accelerator Wizard
The easiest way for new users. It validates your keys and sets up the environment automatically.

```bash
npm run start:wizard
```

## 🛠 Manual YAML Parameters

If you prefer to bypass the wizard, you must manually create a `hsca-config.yaml` file (using this [sample file (hsca-config.sample.yaml)](../../cli/hsca-config.sample.yaml) as a template).

```bash
  cd path/to/cli/
  cp hsca-config.sample.yaml hsca-config.yaml
```

### 1. General Settings
- **defaultNetwork**: Set to `testnet`, `previewnet`, or `mainnet`.
- **networks**: _(Optional)_ for each network:
    - **consensusNodes** : list of consensus nodes **urls** and their respective **node Ids**.
    - **chainId** : network chain Id.

### 2. Accounts Section (Mandatory)
Each account entry in the list requires:
- **accountId**: Your Hedera Account ID (e.g., `0.0.12345`).
- **type**: Choose between `SELF-CUSTODIAL`, `FIREBLOCKS`, `DFNS`, `AWS-KMS`, or `MULTI-SIGNATURE`.
- **network**: The network this account belongs to (`testnet`, `previewnet`, or `mainnet`)
- **alias**: A friendly name for the account.
- For self-custodial accounts:
   - **privateKey** : account's private **key** and private key **type** (choose between ED25519 and ECDSA).
- For non-custodial accounts:
   
   - **fireblocks** : Fireblocks account details.
      - **apiSecretKey** : Fireblocks API secret key.
      - **apiKey** : Fireblocks API key.
      - **baseUrl** : Fireblocks base url.
      - **assetId** : Fireblocks asset Id.
      - **vaultAccountId** : Fireblocks vault account Id.
      - **hederaAccountPublicKey** : Fireblocks Hedera account public key.
   - **dfns** : DFNS account details.
      - **authorizationToken** : DFNS authorization token.
      - **credentialId** : DFNS credential Id.
      - **privateKey** : DFNS private key.
      - **appOrigin** : DFNS app origin.
      - **appId** : DFNS app Id.
      - **testUrl** : DFNS test url.
      - **walletId** : DFNS wallet Id.
      - **hederaAccountPublicKey** : DFNS Hedera account public key.
   - **awsKms** : AWS KMS account details.
      - **accessKeyId** : AWS access key Id.
      - **secretAccessKey** : AWS secret access key.
      - **region** : AWS KMS region.
      - **keyId** : AWS KMS key Id.
      - **hederaAccountPublicKey** : AWS KMS Hedera account public key.
- **importedTokens** : _(Optional)_ list of imported tokens for the account. For each imported token we must specify the token **id**, **symbol** and the list of **roles** the account's has been granted for the token.

### 3. Network Infrastructure
- **mirrors** : _(Mandatory at least one)_ list of mirror nodes.
    - **name** : Mirror node unique name.
    - **network** : Network assigned to this mirror node url, choose between mainnet, testnet and previewnet.
    - **baseUrl** : Mirror node url.
    - **selected** : _true_ if this is the currently selected mirror, _false_ otherwise. At least one mirror node must be selected.
    - **apiKey** : _(Optional)_ API Key that must be provided to the mirror node in order to authenticate the request.
    - **headerName** : _(Optional)_ http header name that will contain the API Key.
- **rpcs** : _(Mandatory at least one)_ list of RPC nodes.
   - **name** : RPC node unique name.
   - **network** : Network assigned to this RPC node url, choose between mainnet, testnet and previewnet.
   - **baseUrl** : RPC node url.
   - **selected** : _true_ if this is the currently selected RPC, _false_ otherwise. At least one RPC node must be selected.
   - **apiKey** : _(Optional)_ API Key that must be provided to the RPC node in order to authenticate the request.
   - **headerName** : _(Optional)_ http header name that will contain the API Key.

### 4. System Logs & Debugging
To help diagnose issues, you can configure the internal logger:
- **logs**:
   - **path**: Directory for log files (Default: `./logs`).
   - **level**: Verbosity level. Options: `ERROR` (Critical only), `WARN`, `INFO` (Standard), `DEBUG` (Dev), `TRACE` (Deep inspection).

### 5. Backend Configuration
Required for Multi-signature flows:
- **backend**: (Optional - required if using MultiSig)
    - **endpoint**: the URL where the backend is listening

### 6. Factories & Resolvers
Used to locate the Stablecoin Studio logic on-chain.
- **factories** : list of factories, at most one per network.
    - **id** : Factory Id.
    - **network** : Network where the factory exists, choose between mainnet, testnet and previewnet.
- **resolvers** : list of resolvers, at most one per network.
    - **id** : Resolver Id.
    - **network** : Network where the resolver exists, choose between mainnet, testnet and previewnet.

