# Stablecoin Studio SDK

The **Stablecoin Studio SDK** is the core TypeScript library empowering the Stablecoin Studio ecosystem. It provides a high-level abstraction for issuing, managing, and operating stablecoins on the Hedera network, streamlining interactions with the Hedera Token Service (HTS) and Smart Contracts.

## 📥 Installation

```bash
npm install @hashgraph/stablecoin-npm-sdk
```

## 🗂️ Documentation Index

- [**🏗️ Architecture & Design**](./architecture.md): Deep dive into connections via RPC, Mirror Nodes, and gRPC.
- [**🚀 Getting Started & Usage**](./usage.md): Code examples for initialization, minting, burning, and transfers.

## 🤝 Contributing

This project is Open Source. We welcome contributions! Please see the root `CONTRIBUTING.md` for more details.

When submitting a PR to the `develop` branch, you must include a changeset file documenting your changes:

```bash
npm run changeset    # Interactive prompt: select packages and bump type
```

If your PR does not require a changeset (documentation, chores, hotfixes), add one of the following labels to bypass the check: `no-changeset`, `docs-only`, `chore`, `hotfix`.
