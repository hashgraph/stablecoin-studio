---
id: quick-start
title: "Smart Contracts - Quick Start"
sidebar_label: Quick Start
sidebar_position: 2
---

# Quick Start

This page covers how to deploy the full contract infrastructure, create individual stablecoins, and upgrade logic through the resolver.

---

## Prerequisites

- Node.js 16+ and npm
- Hardhat (installed as a project dependency)
- A Hedera account with sufficient HBAR balance
- The `.env` file configured with your private key (see `.env.sample`)

---

## Deploy Full Infrastructure

Deploy all facets, the factory, and the business logic resolver in one step:

```shell
npx hardhat deployAll --network <network>
```

This command:

1. Deploys all facets (HederaTokenManagerFacet, KYCFacet, BurnableFacet, CashInFacet, etc.).
2. Deploys and initializes the BusinessLogicResolver.
3. Registers all facets in the resolver under their configuration keys.
4. Creates versioned logic configurations.
5. Deploys a ResolverProxy for the StableCoinFactory.
6. Outputs all deployed contract addresses.

### Optional Flags

| Flag | Description |
| --- | --- |
| `--useDeployed` | Reuse already deployed contracts if addresses are known (default: `true`) |
| `--privateKey` | Use a raw private key as signer instead of Hardhat account |
| `--signerAddress` | Specify signer by address from Hardhat signers |
| `--signerPosition` | Specify signer by index in Hardhat signers array |

---

## Deploy a Stablecoin

Create a single stablecoin using the factory:

```shell
npx hardhat deployStableCoin \
  --businessLogicResolverProxyAddress <resolverProxy> \
  --stableCoinFactoryProxyAddress <factoryProxy> \
  --network <network>
```

### Full Example

```shell
npx hardhat deployStableCoin \
  --tokenName "USD Token" \
  --tokenSymbol "USDT" \
  --tokenDecimals 6 \
  --tokenInitialSupply 1000000 \
  --tokenMaxSupply 10000000 \
  --createReserve true \
  --addKyc true \
  --grantKYCToOriginalSender true \
  --businessLogicResolverProxyAddress 0x123...abc \
  --stableCoinFactoryProxyAddress 0x456...def \
  --network testnet
```

---

## Upgrade Logic

The resolver enables centralized logic upgrades without redeploying stablecoin proxies.

```shell
npx hardhat updateBusinessLogicKeys \
  --resolverAddress <businessLogicResolverAddress> \
  --implementationAddressList <commaSeparatedFacetAddresses> \
  --privateKey <yourPrivateKey> \
  --network <network>
```

> The BusinessLogicResolver must be initialized before registering facets. If not yet initialized, run `initializeBusinessLogicResolver` first.

---

## Migration

### V1 to V2

1. Deploy all new contracts: `npx hardhat deployAll --network <network>`
2. Run the migration task:

```shell
npx hardhat migrateStableCoinToV2 \
  --network <network> \
  --stablecoinconfigurationidkey <configId> \
  --stablecoinconfigurationidversion <version> \
  --businesslogicresolverproxyaddress <blrProxy> \
  --stablecoinaddress <scProxy> \
  --stablecoinproxyadminaddress <scProxyAdmin>
```

### V2 to V3

1. Migrate the BusinessLogicResolver:

```shell
npx hardhat migrateBLRToV3 \
  --blrproxyadminaddress <blrProxyAdmin> \
  --blrproxyaddress <blrProxy> \
  --network <network>
```

2. Redeploy all facets and configurations.

Rollback scripts are available for both migration steps. See the [contracts README](https://github.com/hashgraph/stablecoin-studio/blob/main/contracts/README.md) for full rollback commands.
