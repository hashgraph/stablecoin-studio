# 🚀 Getting Started

Follow this guide to set up your environment and issue your first institutional stablecoin on Hedera.

## 1. Create a Hedera Testnet Account 🔑
1. Go to the **[Hedera Developer Portal](https://portal.hedera.com/)**.
2. Create a **Testnet Account**.
3. **Important:** Copy your `Account ID` (e.g., `0.0.12345`) and your **Hex Private Key**. The SDK requires the Hex format, not DER.

## 2. System Setup 💻
```bash
git clone https://github.com/hashgraph/stablecoin-studio.git
cd stablecoin-studio
npm install
```

## 3. Configuration (.env)
```bash
cp .env.example .env
```
Edit the following fields:
- `OPERATOR_ID`: Your Account ID.
- `OPERATOR_KEY`: Your Hexadecimal Private Key.
- `NETWORK`: `testnet`

## 4. Token Association 🤝
In Hedera, accounts must **Associate** to a token before receiving it. This prevents "token spam".
- **CLI:** `npx stablecoin associate --id 0.0.xxxx`
- **SDK:** `await stablecoin.associate()`

[⬅️ Back to Home](../README.md)
