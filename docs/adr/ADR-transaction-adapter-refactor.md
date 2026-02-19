# ADR: Transaction Adapter Architecture Refactor

**Status:** Proposed
**Date:** 2026-02-19
**Authors:** Mario Francia

## Context

The SDK uses a hexagonal architecture with input ports (`port/in/`) and output ports (`port/out/`). The `TransactionAdapter` is the main output port for blockchain interaction, but its current structure has several architectural issues.

### Current Architecture

```
TransactionAdapter (abstract, ~40 methods with throw "not implemented")
├── BaseHederaTransactionAdapter (composition with 9 operation classes)
│   ├── ClientTransactionAdapter
│   ├── WalletConnectTransactionAdapter
│   ├── MultiSigTransactionAdapter
│   └── CustodialTransactionAdapter (abstract)
│       ├── AWSKMSTransactionAdapter
│       ├── FireblocksTransactionAdapter
│       └── DFNSTransactionAdapter
└── RPCTransactionAdapter (duplicates all contract call logic)
```

### Current Flow (e.g. burn)

```
StableCoin.burn() (port/in)
  → CommandBus → BurnCommand
    → BurnCommandHandler
      → TransactionAdapter.burn()                  (fat output port)
        → BaseHederaTransactionAdapter.burn()      (forwarding)
          → TokenOperations.burn()                 (actual logic)
            → adapter.executeContractCall()        (circular reference back to adapter)
              → adapter.processTransaction()       (finally executes)
```

### Problems

1. **God-object output port.** `TransactionAdapter` has ~40 methods covering tokens, roles, reserves, holds, lifecycle, and signing. In hexagonal architecture, an output port should represent a specific capability, not everything the system can do.

2. **Input and output ports are misaligned.** `StableCoin.ts` (input) covers burn/freeze/rescue, but on the output side these are spread across `TokenOperations`, `TokenControlOperations`, `RescueOperations`. Conversely, `QueryOperations` (output) mixes queries from different input port domains.

3. **Business logic lives in infrastructure.** `CapabilityDecider` (deciding HTS vs Contract path) and transaction building (ABI encoding, EVM address resolution) are domain concerns, but they live inside the output adapter. Wallets should not know what a "burn" or "freeze" is.

4. **Runtime errors instead of compile-time safety.** `TransactionAdapter` is `abstract` but its ~40 methods are concrete implementations that `throw new Error('Method not implemented.')`. If a new adapter forgets to implement a method, TypeScript does not catch it — it compiles fine and fails at runtime.

5. **Unnecessary indirection.** 9 operation classes are instantiated in the constructor. Each of the ~40 public methods in `BaseHederaTransactionAdapter` simply forwards to an operation class, which then calls back to the adapter (circular dependency).

6. **No contract between layers.** CommandHandlers depend on the concrete `TransactionAdapter` class, not on segregated interfaces. This violates the Dependency Inversion Principle.

## Decision

Separate wallet infrastructure from business operation logic by introducing small, focused output port interfaces.

### Proposed Architecture

#### Output Port Interfaces

```typescript
// The wallet only knows how to execute a pre-built transaction
interface TransactionExecutor {
    execute(tx: Transaction, type: TransactionType): Promise<TransactionResponse>;
}

// Wallet lifecycle is a separate concern
interface WalletConnection {
    init(): Promise<Environment>;
    register(settings: WalletSettings): Promise<InitializationData>;
    stop(): Promise<boolean>;
    sign(message: string | Transaction): Promise<string>;
}
```

#### Infrastructure (Wallets)

Each wallet implements only execution and connection — no business logic:

```
infra/
└── wallet/
    ├── ClientWallet.ts              implements TransactionExecutor, WalletConnection
    ├── WalletConnectWallet.ts       implements TransactionExecutor, WalletConnection
    ├── MultiSigWallet.ts            implements TransactionExecutor, WalletConnection
    └── custodial/
        ├── AWSKMSWallet.ts          implements TransactionExecutor, WalletConnection
        ├── FireblocksWallet.ts       implements TransactionExecutor, WalletConnection
        └── DFNSWallet.ts            implements TransactionExecutor, WalletConnection
```

Wallet implementations become trivial:

```typescript
class ClientWallet implements TransactionExecutor, WalletConnection {
    execute(tx, type) { return tx.execute(this.client); }
}

class MultiSigWallet implements TransactionExecutor, WalletConnection {
    execute(tx, type) { return this.backend.serialize(tx); }
}
```

#### Use Cases (CommandHandlers)

Business logic (CapabilityDecider, transaction building, ABI encoding) moves to the use case layer where it belongs:

```typescript
// BurnCommandHandler.ts
class BurnCommandHandler {
    constructor(
        private executor: TransactionExecutor,    // output port
        private mirrorNode: MirrorNodePort,       // output port
    ) {}

    async execute(command: BurnCommand) {
        const decision = CapabilityDecider.decide(coin, Operation.BURN);

        if (decision === Decision.CONTRACT) {
            const tx = buildContractTransaction(contractId, abi, 'burn', [amount]);
            return this.executor.execute(tx, TransactionType.RECEIPT);
        } else if (decision === Decision.HTS) {
            const tx = new TokenBurnTransaction().setTokenId(tokenId).setAmount(amount);
            return this.executor.execute(tx, TransactionType.RECEIPT);
        }
    }
}
```

### Proposed Flow (e.g. burn)

```
StableCoin.burn() (port/in)
  → CommandBus → BurnCommand
    → BurnCommandHandler (use case — owns the business logic)
        ├─ CapabilityDecider → HTS or Contract?
        ├─ Builds the transaction
        └─ transactionExecutor.execute(tx) → ClientWallet.execute(tx)
                                              WalletConnectWallet.execute(tx)
                                              MultiSigWallet.execute(tx)
                                              CustodialWallet.execute(tx)
```

## Consequences

### Benefits

| Aspect | Before | After |
|---|---|---|
| Output port interface | 1 fat interface, ~40 methods | 2 small interfaces (`TransactionExecutor` + `WalletConnection`) |
| Business logic location | Inside adapter (infrastructure) | Inside CommandHandler (use case layer) |
| Wallet responsibility | Knows how to burn, freeze, etc. | Only knows how to execute a pre-built transaction |
| Adding a new operation | Touch adapter + operation class + forwarding | Only touch the CommandHandler |
| Adding a new wallet | Inherit ~40 methods | Implement `execute()` + lifecycle |
| Type safety | Runtime errors (`throw new Error`) | Compile-time errors (interface contract) |
| Testing | Must mock entire wallet to test burn | Mock `execute(tx)` to test burn |
| Circular dependencies | adapter → operations → adapter | None |

### Risks

- **Large refactor.** Touches CommandHandlers, adapters, and the DI container. Should be done incrementally.
- **WalletConnect EVM sessions.** `WalletConnectWallet` currently overrides `executeContractCall()` to handle EVM address translation. This logic would need to move into the use case or a shared transaction builder service.
- **RPCTransactionAdapter.** Currently planned for removal. If kept, it would need its own `TransactionExecutor` implementation using ethers signer.

### Migration Strategy

1. **Phase 1:** Define `TransactionExecutor` and `WalletConnection` interfaces alongside existing code
2. **Phase 2:** Implement interfaces in each wallet adapter (thin wrappers over existing `processTransaction`)
3. **Phase 3:** Migrate CommandHandlers one by one to use `TransactionExecutor` instead of `TransactionAdapter`
4. **Phase 4:** Remove `BaseHederaTransactionAdapter`, operation classes, and the fat `TransactionAdapter` base class
