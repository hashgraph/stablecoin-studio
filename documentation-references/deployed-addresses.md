---
id: deployed-addresses
title: Deployed Addresses
sidebar_label: Deployed Addresses
sidebar_position: 2
---

# Deployed Addresses

This page lists the factory and resolver contract addresses deployed for each version of Stablecoin Studio.

When configuring the SDK, CLI, or Web DApp, use the addresses corresponding to your target version and network.

---

| Version | Factory | Resolver | Network |
| --- | --- | --- | --- |
| 4.0.0 | `0.0.7353542` | `0.0.7353500` | Testnet |
| 3.0.1 | `0.0.7095398` | `0.0.7095368` | Testnet |
| 3.0.0 | `0.0.7095398` | `0.0.7095368` | Testnet |
| 2.1.6 | `0.0.6431833` | `0.0.6431794` | Testnet |
| 2.1.5 | `0.0.6349500` | `0.0.6349477` | Testnet |
| 2.1.0 | `0.0.6176922` | — | Testnet |
| 2.0.0 | `0.0.6095357` | `0.0.6095328` | Testnet |
| 1.27.6 | `0.0.5088833` | — | Testnet |
| 1.27.0 | `0.0.5088833` | — | Testnet |
| 1.26.1 | `0.0.2167166` | — | Testnet |
| 1.26.0 | `0.0.2167166` | — | Testnet |
| 1.25.0 | `0.0.2167166` | — | Testnet |
| 1.24.0 | `0.0.2167166` | — | Testnet |
| 1.23.1 | `0.0.2167166` | — | Testnet |
| 1.23.0 | `0.0.2167166` | — | Testnet |
| 1.22.0 | `0.0.2167166` | — | Testnet |
| 1.21.1 | `0.0.2167166` | — | Testnet |
| 1.21.0 | `0.0.2167166` | — | Testnet |
| 1.20.1 | `0.0.2167166` | — | Testnet |
| 1.20.0 | `0.0.2167166` | — | Testnet |
| 1.19.0 | `0.0.2167166` | — | Testnet |
| 1.18.1 | `0.0.2167166` | — | Testnet |
| 1.18.0 | `0.0.2167166` | — | Testnet |
| 1.17.0 | `0.0.2167166` | — | Testnet |
| 1.16.0 | `0.0.2167166` | — | Testnet |
| 1.15.4 | `0.0.2167166` | — | Testnet |
| 1.15.3 | `0.0.2167166` | — | Testnet |
| 1.15.2 | `0.0.2167166` | — | Testnet |
| 1.15.0 | `0.0.2167166` | — | Testnet |
| 1.14.0 | `0.0.2167166` | — | Testnet |
| 1.13.0 | `0.0.1137631` | — | Testnet |
| 1.12.0 | `0.0.1137631` | — | Testnet |
| 1.11.0 | `0.0.1137631` | — | Testnet |
| 1.10.0 | `0.0.1137631` | — | Testnet |
| 1.9.1 | `0.0.1137631` | — | Testnet |
| 1.9.0 | `0.0.1137631` | — | Testnet |
| 1.8.0 | `0.0.1137631` | — | Testnet |

> Versions before 2.0.0 did not use the BusinessLogicResolver (pre-diamond architecture).

---

## Where to Configure These Addresses

### SDK

Set in `sdk/.env`:

```env
FACTORY_ADDRESS=0.0.XXXX
```

### CLI

Set in `cli/hsca-config.yaml`:

```yaml
factories:
  - id: 0.0.XXXX
    network: testnet
resolvers:
  - id: 0.0.XXXX
    network: testnet
```

### Web DApp

Set in `web/.env`:

```env
REACT_APP_FACTORIES='[{"Environment":"testnet","STABLE_COIN_FACTORY_ADDRESS":"0.0.XXXX"}]'
REACT_APP_RESOLVERS='[{"Environment":"testnet","STABLE_COIN_RESOLVER_ADDRESS":"0.0.XXXX"}]'
```
