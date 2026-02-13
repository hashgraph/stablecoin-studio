---
id: migration
title: Migration Guides
sidebar_label: Migration
sidebar_position: 1
---

# Migration Guides

This page documents the procedures for migrating stablecoins, factories, and resolvers between major versions of Stablecoin Studio.

---

## V1 to V2

### Overview

The V2 release introduced the **diamond proxy pattern with centralized resolver**. Migrating a V1 stablecoin replaces its proxy implementation with the new resolver-based architecture.

### Prerequisites

- All modules built: `npm run install:all`
- New contracts deployed: `npx hardhat deployAll --network <network>`
- The private key of the account set as `owner` in the stablecoin's Proxy admin

### Migration Steps

1. Set the proxy admin owner's private key in `.env`:

```env
TESTNET_PRIVATE_KEY_0='0x...'
```

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

### Parameters

| Parameter | Description | Default |
| --- | --- | --- |
| `--network` | Target network (`testnet`, `mainnet`) | Required |
| `--stablecoinconfigurationidkey` | Configuration key (bytes32) | `0x000...0002` |
| `--stablecoinconfigurationidversion` | Configuration version (integer) | `1` |
| `--businesslogicresolverproxyaddress` | BLR proxy EVM address (from `contractAddresses_v2.txt`) | Required |
| `--stablecoinaddress` | Stablecoin proxy EVM address (from CLI/Web details: `evmProxyAddress`) | Required |
| `--stablecoinproxyadminaddress` | Stablecoin proxy admin EVM address (from CLI/Web details: `evmProxyAdminAddress`) | Required |

### Example

```shell
npx hardhat migrateStableCoinToV2 \
  --network testnet \
  --stablecoinconfigurationidkey 0x0000000000000000000000000000000000000000000000000000000000000002 \
  --stablecoinconfigurationidversion 1 \
  --businesslogicresolverproxyaddress 0x842760dE0dA78543d6C3df7874156450227694Fc \
  --stablecoinaddress 0x26d43efe6c2064f4f39c508778d76204af5d967a \
  --stablecoinproxyadminaddress 0x9a56d9a73c3073496604d85824ab7646ef1f2098
```

### Post-Migration: Update Client Configuration

**Web DApp** — Update `web/.env`:

```env
REACT_APP_FACTORIES='[{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.XXXX"}]'
REACT_APP_RESOLVERS='[{"Environment":"testnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.XXXX"}]'
```

Find the factory address under "Stable Coin Factory Facet Proxy" and the resolver address under "Business Logic Resolver Proxy" in `contracts/contractAddresses_v2.txt`. Convert hex addresses to Hedera IDs using [HashScan](https://hashscan.io).

**CLI** — Update `cli/hsca-config.yaml`:

```yaml
factories:
  - id: 0.0.XXXX
    network: testnet
resolvers:
  - id: 0.0.XXXX
    network: testnet
```

---

## V2 to V3

### Overview

The V3 release updates the BusinessLogicResolver internals. Migration requires updating the BLR first, then redeploying facets and configurations, and finally updating any deployed contracts that use a non-zero version.

### Step 1: Migrate the BusinessLogicResolver

```shell
npx hardhat migrateBLRToV3 \
  --blrproxyadminaddress <blrProxyAdminEVM> \
  --blrproxyaddress <blrProxyEVM> \
  --network <network>
```

This deploys the BLR V3 implementation and upgrades the proxy to use it.

### Step 2: Redeploy Facets and Configurations

After the BLR migration, redeploy all facets and register them in the resolver. This step is handled by the `deployAll` task.

### Step 3: Update Deployed Contract Versions (Optional)

Only required for stablecoins, factories, and reserves that were **not** set to version "0":

```shell
npx hardhat upgradeResolverProxyversion \
  --resolverproxyaddress <address> \
  --network <network>
```

Run this for each deployed contract (stablecoin, factory, reserve) that needs to pick up the new configuration version.

### Rollback

Both migration steps can be rolled back.

**Rollback BLR migration:**

```shell
npx hardhat rollbackResolverProxyToVersion \
  --blrproxyadminaddress <blrProxyAdminEVM> \
  --blrproxyaddress <blrProxyEVM> \
  --blrv2implementationaddress <blrV2ImplementationEVM> \
  --network <network>
```

**Rollback contract version upgrade:**

```shell
npx hardhat rollbackSCToVersion \
  --resolverproxyaddress <address> \
  --configversion <previousVersion> \
  --network <network>
```

---

## Testnet Reset Procedure

When the Hedera testnet is reset, all deployed contracts are lost. To restore functionality:

1. Deploy new infrastructure: `cd contracts && npx hardhat deployAll --network testnet`
2. Update factory addresses in:
   - SDK `.env`
   - CLI `hsca-config.yaml`
   - Web `.env`
3. Update resolver addresses in the same files.
4. Create a PR with the updated addresses.

See [Deployed Addresses](./deployed-addresses.md) for current factory and resolver addresses.
