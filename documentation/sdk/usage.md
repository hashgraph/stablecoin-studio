---
id: usage
title: "SDK - Usage"
sidebar_label: Usage
sidebar_position: 3
---

# Usage

This guide covers the operations you can perform with the Stablecoin Studio SDK after completing [initialization](./quick-start.md).

All examples assume the shared setup below is already in place.

---

## Shared Setup

```typescript
import {
  Network,
  InitializationRequest,
  ConnectRequest,
  SupportedWallets,
} from '@hashgraph/stablecoin-npm-sdk';

const mirrorNodeConfig = {
  name: 'Testnet Mirror Node',
  network: 'testnet',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
  apiKey: '',
  headerName: '',
  selected: true,
};

const rpcNodeConfig = {
  name: 'HashIO',
  network: 'testnet',
  baseUrl: 'https://testnet.hashio.io/api',
  apiKey: '',
  headerName: '',
  selected: true,
};

await Network.init(
  new InitializationRequest({
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    configuration: {
      factoryAddress: process.env.FACTORY_ADDRESS!,
      resolverAddress: process.env.RESOLVER_ADDRESS!,
    },
  }),
);

const accountId = process.env.MY_ACCOUNT_ID!;

await Network.connect(
  new ConnectRequest({
    account: {
      accountId,
      privateKey: { key: process.env.MY_PRIVATE_KEY!, type: 'ED25519' },
    },
    network: 'testnet',
    mirrorNode: mirrorNodeConfig,
    rpcNode: rpcNodeConfig,
    wallet: SupportedWallets.CLIENT,
  }),
);
```

> All examples on this page use `SupportedWallets.CLIENT`, which signs transactions internally using the provided private key. If you need to integrate a browser wallet (MetaMask, HashPack, HWC), an external signer, a multisig backend, or a custodial provider (Fireblocks, DFNS, AWS KMS), see [Wallet Adapters](./wallet-adapters.md).

---

## Token Creation

### Basic stablecoin

```typescript
import {
  StableCoin,
  CreateRequest,
  TokenSupplyType,
} from '@hashgraph/stablecoin-npm-sdk';

const result = await StableCoin.create(
  new CreateRequest({
    name: 'My Stablecoin',
    symbol: 'MSC',
    decimals: 6,
    initialSupply: '1000',
    supplyType: TokenSupplyType.INFINITE,
    createReserve: false,
    grantKYCToOriginalSender: true,
    burnRoleAccount: accountId,
    wipeRoleAccount: accountId,
    rescueRoleAccount: accountId,
    pauseRoleAccount: accountId,
    freezeRoleAccount: accountId,
    deleteRoleAccount: accountId,
    kycRoleAccount: accountId,
    cashInRoleAccount: accountId,
    feeRoleAccount: accountId,
    cashInRoleAllowance: '0',
    proxyOwnerAccount: accountId,
    configId: '0x0000000000000000000000000000000000000000000000000000000000000002',
    configVersion: 1,
  }),
) as { coin: any; reserve: any };

const tokenId = result.coin.tokenId.toString();
console.log('Token ID:', tokenId);
```

### With a reserve

Pass `createReserve: true` and provide the reserve config to deploy a Chainlink-compatible data feed alongside the token:

```typescript
const result = await StableCoin.create(
  new CreateRequest({
    name: 'Reserve Stablecoin',
    symbol: 'RSC',
    decimals: 2,
    initialSupply: '1000',
    supplyType: TokenSupplyType.INFINITE,
    createReserve: true,
    reserveInitialAmount: '10000',
    reserveConfigId: '0x0000000000000000000000000000000000000000000000000000000000000003',
    reserveConfigVersion: 1,
    // ... role accounts and other fields
  }),
) as { coin: any; reserve: any };

console.log('Token ID:', result.coin.tokenId.toString());
console.log('Reserve proxy:', result.reserve.proxyAddress);
```

---

## Token Association & KYC

Before an account can receive tokens, it must associate itself and (if KYC is required) be granted KYC.

```typescript
import {
  StableCoin,
  AssociateTokenRequest,
  KYCRequest,
} from '@hashgraph/stablecoin-npm-sdk';

// Associate the token with the account
await StableCoin.associate(
  new AssociateTokenRequest({
    targetId: accountId,
    tokenId,
  }),
);

// Grant KYC to the account
await StableCoin.grantKyc(
  new KYCRequest({
    targetId: accountId,
    tokenId,
  }),
);

// Revoke KYC
await StableCoin.revokeKyc(
  new KYCRequest({
    targetId: accountId,
    tokenId,
  }),
);
```

---

## Cash-In (Minting)

Mint new tokens to an account. Requires `CASHIN_ROLE`.

```typescript
import { StableCoin, CashInRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.cashIn(
  new CashInRequest({
    tokenId,
    targetId: accountId,
    amount: '100',
  }),
);
```

### Check balance

```typescript
import {
  StableCoin,
  GetAccountBalanceRequest,
} from '@hashgraph/stablecoin-npm-sdk';

const balance = await StableCoin.getBalanceOf(
  new GetAccountBalanceRequest({
    tokenId,
    targetId: accountId,
  }),
);

console.log('Balance:', balance.value.toString());
```

---

## Burn

Burn tokens from the treasury supply. Requires `BURN_ROLE`.

```typescript
import { StableCoin, BurnRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.burn(
  new BurnRequest({
    tokenId,
    amount: '50',
  }),
);
```

---

## Wipe

Remove tokens from a specific account's balance. Requires `WIPE_ROLE`.

```typescript
import { StableCoin, WipeRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.wipe(
  new WipeRequest({
    tokenId,
    targetId: accountId,
    amount: '10',
  }),
);
```

---

## Pause & Unpause

Halt all token transfers. Requires `PAUSE_ROLE`.

```typescript
import { StableCoin, PauseRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.pause(new PauseRequest({ tokenId }));

await StableCoin.unPause(new PauseRequest({ tokenId }));
```

---

## Freeze & Unfreeze

Freeze or unfreeze a specific account's token balance. Requires `FREEZE_ROLE`.

```typescript
import { StableCoin, FreezeAccountRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.freeze(
  new FreezeAccountRequest({ tokenId, targetId: accountId }),
);

await StableCoin.unFreeze(
  new FreezeAccountRequest({ tokenId, targetId: accountId }),
);
```

---

## Role Management

The `Role` class handles all role grants, revocations, and checks.

### Available roles

```typescript
import { StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';

// StableCoinRole enum values:
// CASHIN_ROLE, BURN_ROLE, WIPE_ROLE, RESCUE_ROLE,
// PAUSE_ROLE, FREEZE_ROLE, DELETE_ROLE, KYC_ROLE,
// FEE_ROLE, HOLD_CREATOR_ROLE
```

### Grant a role

```typescript
import { Role, GrantRoleRequest, StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';

await Role.grantRole(
  new GrantRoleRequest({
    tokenId,
    targetId: accountId,
    role: StableCoinRole.WIPE_ROLE,
  }),
);
```

### Grant a limited cash-in role (supplier allowance)

```typescript
await Role.grantRole(
  new GrantRoleRequest({
    tokenId,
    targetId: accountId,
    role: StableCoinRole.CASHIN_ROLE,
    supplierType: 'limited',
    amount: '100',
  }),
);
```

### Revoke a role

```typescript
import { Role, RevokeRoleRequest, StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';

await Role.revokeRole(
  new RevokeRoleRequest({
    tokenId,
    targetId: accountId,
    role: StableCoinRole.WIPE_ROLE,
  }),
);
```

### Check if an account has a role

```typescript
import { Role, HasRoleRequest, StableCoinRole } from '@hashgraph/stablecoin-npm-sdk';

const hasRole = await Role.hasRole(
  new HasRoleRequest({
    tokenId,
    targetId: accountId,
    role: StableCoinRole.WIPE_ROLE,
  }),
);

console.log('Has WIPE_ROLE:', hasRole);
```

### Grant / revoke multiple roles at once

```typescript
import {
  Role,
  GrantMultiRolesRequest,
  RevokeMultiRolesRequest,
  StableCoinRole,
} from '@hashgraph/stablecoin-npm-sdk';

await Role.grantMultiRoles(
  new GrantMultiRolesRequest({
    tokenId,
    targetsId: [accountId],
    roles: [StableCoinRole.FREEZE_ROLE, StableCoinRole.PAUSE_ROLE],
  }),
);

await Role.revokeMultiRoles(
  new RevokeMultiRolesRequest({
    tokenId,
    targetsId: [accountId],
    roles: [StableCoinRole.FREEZE_ROLE, StableCoinRole.PAUSE_ROLE],
  }),
);
```

---

## Supplier Allowance

When an account holds a limited `CASHIN_ROLE`, you can adjust how many tokens it is allowed to mint without re-granting the role.

```typescript
import {
  Role,
  IncreaseSupplierAllowanceRequest,
  DecreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
} from '@hashgraph/stablecoin-npm-sdk';

// Increase the allowance by 50
await Role.increaseAllowance(
  new IncreaseSupplierAllowanceRequest({
    tokenId,
    targetId: accountId,
    amount: '50',
  }),
);

// Decrease the allowance by 25
await Role.decreaseAllowance(
  new DecreaseSupplierAllowanceRequest({
    tokenId,
    targetId: accountId,
    amount: '25',
  }),
);

// Reset allowance to 0
await Role.resetAllowance(
  new ResetSupplierAllowanceRequest({
    tokenId,
    targetId: accountId,
  }),
);
```

---

## Custom Fees

The `Fees` class manages HTS custom fee schedules. Requires `FEE_ROLE`.

### Add a fixed HBAR fee

```typescript
import { Fees, AddFixedFeeRequest } from '@hashgraph/stablecoin-npm-sdk';

await Fees.addFixedFee(
  new AddFixedFeeRequest({
    tokenId,
    collectorId: accountId,
    collectorsExempt: true,
    decimals: 2,
    tokenIdCollected: '0.0.0', // '0.0.0' means HBAR
    amount: '1',
  }),
);
```

### Add a fractional fee

```typescript
import { Fees, AddFractionalFeeRequest } from '@hashgraph/stablecoin-npm-sdk';

await Fees.addFractionalFee(
  new AddFractionalFeeRequest({
    tokenId,
    collectorId: accountId,
    collectorsExempt: true,
    decimals: 2,
    percentage: '1',  // 1%
    min: '0',
    max: '10',
    net: false,
  }),
);
```

### Update (replace) all custom fees

Pass an empty array to remove all fees.

```typescript
import { Fees, UpdateCustomFeesRequest } from '@hashgraph/stablecoin-npm-sdk';

await Fees.updateCustomFees(
  new UpdateCustomFeesRequest({
    tokenId,
    customFees: [],
  }),
);
```

---

## Rescue

Recover HTS tokens or HBAR that are stranded inside the proxy contract. Requires `RESCUE_ROLE`.

```typescript
import {
  StableCoin,
  RescueRequest,
  RescueHBARRequest,
} from '@hashgraph/stablecoin-npm-sdk';

// Rescue HTS tokens
await StableCoin.rescue(
  new RescueRequest({ tokenId, amount: '10' }),
);

// Rescue HBAR
await StableCoin.rescueHBAR(
  new RescueHBARRequest({ tokenId, amount: '0.5' }),
);
```

---

## Holds

Holds let you lock tokens in escrow without transferring ownership. They can be released (returned to sender) or executed (transferred to the target) by the escrow account, and reclaimed by the sender after expiry.

### Create a hold

```typescript
import { StableCoin, CreateHoldRequest } from '@hashgraph/stablecoin-npm-sdk';

const expirationDate = Math.floor(Date.now() / 1000 + 3600).toString(); // 1 hour

await StableCoin.createHold(
  new CreateHoldRequest({
    tokenId,
    amount: '5',
    escrow: accountId,       // account that can release or execute
    expirationDate,
    targetId: accountId,     // beneficiary if executed
  }),
);
```

### Create a hold by controller

A controller (e.g. a compliance account) can place a hold on behalf of a source account.

```typescript
import {
  StableCoin,
  CreateHoldByControllerRequest,
} from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.createHoldByController(
  new CreateHoldByControllerRequest({
    tokenId,
    amount: '5',
    escrow: accountId,
    expirationDate,
    sourceId: accountId,
    targetId: accountId,
  }),
);
```

### Get hold IDs

```typescript
import { StableCoin, GetHoldsIdForRequest } from '@hashgraph/stablecoin-npm-sdk';

const holdIds = await StableCoin.getHoldsIdFor(
  new GetHoldsIdForRequest({
    tokenId,
    sourceId: accountId,
    start: 0,
    end: 100,
  }),
);
```

### Execute a hold (transfer to beneficiary)

```typescript
import { StableCoin, ExecuteHoldRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.executeHold(
  new ExecuteHoldRequest({
    tokenId,
    sourceId: accountId,
    holdId: holdIds[0] as number,
    amount: '5',
    targetId: accountId,
  }),
);
```

### Release a hold (return to sender)

```typescript
import { StableCoin, ReleaseHoldRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.releaseHold(
  new ReleaseHoldRequest({
    tokenId,
    sourceId: accountId,
    holdId: holdIds[0] as number,
    amount: '5',
  }),
);
```

### Reclaim an expired hold

```typescript
import { StableCoin, ReclaimHoldRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.reclaimHold(
  new ReclaimHoldRequest({
    tokenId,
    sourceId: accountId,
    holdId: holdIds[0] as number,
  }),
);
```

---

## Token Update

Rename or modify the token's metadata. Requires the admin key.

```typescript
import { StableCoin, UpdateRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.update(
  new UpdateRequest({
    tokenId,
    name: 'New Name',
    symbol: 'NEW',
  }),
);
```

---

## Reserve Updates

### Update the reserve address

```typescript
import {
  StableCoin,
  UpdateReserveAddressRequest,
} from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.updateReserveAddress(
  new UpdateReserveAddressRequest({
    tokenId,
    reserveAddress: '0.0.98765',
  }),
);
```

### Update the reserve amount

```typescript
import {
  ReserveDataFeed,
  UpdateReserveAmountRequest,
} from '@hashgraph/stablecoin-npm-sdk';

await ReserveDataFeed.updateReserveAmount(
  new UpdateReserveAmountRequest({
    reserveAddress: '0.0.98765',
    reserveAmount: '5000',
  }),
);
```

---

## Config & Resolver Updates

The `Management` class controls the proxy's config and resolver pointers.

```typescript
import {
  Management,
  UpdateConfigRequest,
  UpdateConfigVersionRequest,
  UpdateResolverRequest,
} from '@hashgraph/stablecoin-npm-sdk';

const CONFIG_ID = '0x0000000000000000000000000000000000000000000000000000000000000002';

// Update config ID and version
await Management.updateConfig(
  new UpdateConfigRequest({
    tokenId,
    configId: CONFIG_ID,
    configVersion: 2,
  }),
);

// Update config version only
await Management.updateConfigVersion(
  new UpdateConfigVersionRequest({ tokenId, configVersion: 2 }),
);

// Update the resolver address
await Management.updateResolver(
  new UpdateResolverRequest({
    tokenId,
    configId: CONFIG_ID,
    configVersion: 2,
    resolver: process.env.RESOLVER_ADDRESS!,
  }),
);
```

---

## Delete

Permanently delete the token. Requires `DELETE_ROLE`. This is irreversible.

```typescript
import { StableCoin, DeleteRequest } from '@hashgraph/stablecoin-npm-sdk';

await StableCoin.delete(new DeleteRequest({ tokenId }));
```

---

## Query Token Info

```typescript
import {
  StableCoin,
  GetStableCoinDetailsRequest,
} from '@hashgraph/stablecoin-npm-sdk';

const info = await StableCoin.getInfo(
  new GetStableCoinDetailsRequest({ id: tokenId }),
);

console.log('Total supply:', info.totalSupply?.toString());
console.log('Decimals:', info.decimals);
console.log('Name:', info.name);
```

---

## Next Steps

- [Wallet Adapters](./wallet-adapters.md) — Signing with external wallets and multisig accounts
- [Architecture](./architecture.md) — Connectivity layers and internal design
