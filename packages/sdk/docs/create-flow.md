# Flujo completo: `create` con firma Hedera (Client)

## Punto de entrada

```typescript
import { StableCoin } from './core/StableCoin.js';

// .env: HEDERA_NETWORK=testnet, HEDERA_OPERATOR_ID=0.0.xxx, HEDERA_PRIVATE_KEY=0x...
const sdk = StableCoin.fromEnvironment();

const result = await sdk.create({
  name: 'MyToken',
  symbol: 'MTK',
  factoryAddress: '0x0cA8...',
  resolverAddress: '0x9fc3...',
  signerAddress: '0x43a2...',
});
// result = { success, transactionId, proxyAddress, tokenAddress, reserveProxy }
```

---

## Fase 0 — Configuración (constructor)

### `StableCoin.fromEnvironment()` → `StableCoin.ts` + `config/fromEnvironment.ts`

```typescript
// StableCoin.ts — fachada pública
static fromEnvironment(env?): StableCoin {
  return new StableCoin(fromEnvironment(env));
  // → internamente crea un TransactionOrchestrator
}

// fromEnvironment.ts
export function fromEnvironment(env = process.env): EnvironmentConfig {
  const network = requireEnv(env, 'HEDERA_NETWORK');  // → 'testnet'
  const signing = resolveSigning(env);
  // operatorId + privateKey → { type: 'client', operatorId, privateKey }
  return { network, signing };
}
```

### `new TransactionOrchestrator(config)` → `orchestration/TransactionOrchestrator.ts` (interno)

```typescript
constructor(private readonly config: OrchestratorConfig) {
  // 'testnet' → { mirrorNode: 'https://testnet.mirrornode...', jsonRpcRelay: 'https://testnet.hashio...' }
  this.network = resolveNetwork(config.network);

  // { type:'client', operatorId, privateKey }
  //   → crea Client.forTestnet(), client.setOperator(id, key)
  //   → { type: 'client', client: Client }
  this.signing = resolveSigningConfig(config.signing, this.network);

  // Registra 27 config-driven + @Operation('create')
  this.operationRegistry = new OperationRegistry();
}
```

### `resolveSigningConfig()` → `config/resolveSigningConfig.ts`

```typescript
export function resolveSigningConfig(signing, network): ResolvedSigningConfig {
  if (signing.type === 'client') {
    if ('client' in signing) return signing;  // ya tiene Client

    // Tiene operatorId + privateKey → auto-crear Client
    const client = Client.forTestnet();  // según network
    client.setOperator(signing.operatorId, PrivateKey.fromString(signing.privateKey));
    return { type: 'client', client };
  }
  // ... otros tipos (signer, external, custodial, multisig)
}
```

### `new OperationRegistry()` → `orchestration/registry/OperationRegistry.ts`

```typescript
constructor() {
  // 27 operaciones declarativas (pause, burn, cashIn, freeze, ...)
  for (const config of OPERATION_CONFIGS) {
    this.operations.set(config.name, new ConfigDrivenOperation(config));
  }
  // Operaciones con @Operation decorator (CreateStableCoinOperation)
  for (const [name, OperationClass] of getRegisteredOperations()) {
    this.operations.set(name, new OperationClass());
    // 'create' → new CreateStableCoinOperation()
  }
}
```

---

## Fase 1 — `sdk.create(params)` → `orchestrator.execute('create', params)`

### `StableCoin.create()` → `StableCoin.ts`

```typescript
async create(params: CreateStableCoinParams): Promise<CreateStableCoinResult> {
  return this.orchestrator.execute('create', params);
  // → delega al orchestrator interno
}
```

### `TransactionOrchestrator.execute()` → `orchestration/TransactionOrchestrator.ts`

```typescript
async execute(operationName: string, params: Record<string, unknown>): Promise<OperationOutcome> {
  const operation = this.operationRegistry.get(operationName);
  // → CreateStableCoinOperation (extends BaseContractOperation)

  // ¿Es composite? No — ahora extiende BaseContractOperation
  if (operation instanceof BaseCompositeOperation) {
    return this.executeComposite(operation, params);  // NO entra aquí
  }

  // Flujo normal: prepareContext → createExecutor → execute
  const context = this.prepareContext(operationName, params);
  const executor = this.createExecutor();
  return executor.execute(context);
}
```

### `prepareContext()` — monta el ExecutionContext

```typescript
private prepareContext(operationName, params): ExecutionContext {
  const builder = this.operationRegistry.get(operationName);
  // builder = CreateStableCoinOperation (implementa TransactionBuilder)

  const mode = isHederaSigning(this.signing) ? 'hedera' : 'evm';
  // mode = 'hedera' (porque signing.type === 'client')

  builder.validate(params);
  // → CreateStableCoinOperation.validateParams():
  //     if (!params.name) throw 'Token name is required'
  //     if (!params.factoryAddress) throw ...
  //     if (!params.signerAddress) throw ...

  return { operationName: 'create', params, builder };
  // builder es quien sabe construir la transacción
}
```

### `createExecutor()` — monta el pipeline

```typescript
private createExecutor(): TransactionExecutor {
  const steps = buildPipeline(this.signing);
  const errorHandler = this.createErrorHandler();
  return new TransactionExecutor(steps, errorHandler);
}
```

### `buildPipeline(signing)` → `dlt/buildPipeline.ts`

```typescript
export function buildPipeline(signing: ResolvedSigningConfig): ExecutionStep[] {
  switch (signing.type) {
    case 'client':                              // ◄── NUESTRO CASO
      return [
        new BuildHederaStep(),                  // Step 1: construir tx
        new SignWithClientStep(signing.client),  // Step 2: firmar con operador
        new SubmitToHederaStep(signing.client),  // Step 3: enviar a Hedera
        new ParseHederaReceiptStep(signing.client), // Step 4: obtener receipt
        new ExtractResultStep(),                // Step 5: extraer resultado
      ];

    case 'signer':      // EVM con ethers Signer
    case 'hedera-external':  // wallet externo Hedera
    case 'evm-external':     // wallet externo EVM
    case 'custodial':        // Fireblocks, DFNS, KMS
    case 'multisig':         // solo serializa
  }
}
```

---

## Fase 2 — `executor.execute(context)` — Pipeline secuencial

### `TransactionExecutor` → `dlt/base/TransactionExecutor.ts`

```typescript
export class TransactionExecutor {
  constructor(
    private steps: ExecutionStep[],
    private errorHandler: ExecutionErrorHandler = new DefaultExecutionErrorHandler()
  ) {}

  async execute(context: ExecutionContext): Promise<OperationOutcome> {
    let ctx = context;

    for (const step of this.steps) {
      try {
        ctx = await step.execute(ctx);        // cada step enriquece el ctx
      } catch (error) {
        ctx = await this.errorHandler.handle(error, step, ctx);
      }
    }

    return ctx.result;
  }
}
```

### `ExecutionContext` — el objeto que viaja por el pipeline

```typescript
interface ExecutionContext {
  readonly operationName: string;    // 'create'
  readonly params: Record<string, unknown>;  // { name, symbol, factoryAddress, ... }
  readonly builder: TransactionBuilder;      // CreateStableCoinOperation

  transaction?: HederaTransaction;     // ← Step 1 lo llena
  signedTransaction?: HederaSignedTx;  // ← Step 2 lo llena
  response?: TransactionResponse;      // ← Step 3 lo llena
  receipt?: TransactionReceipt;        // ← Step 4 lo llena
  result?: OperationOutcome;           // ← Step 5 lo llena
}
```

---

## Step 1 — `BuildHederaStep` → `dlt/hedera/steps/BuildHederaStep.ts`

```typescript
export class BuildHederaStep implements ExecutionStep {
  readonly name = 'BuildHedera';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const transaction = ctx.builder.buildHederaTransaction(ctx.params);
    //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                  Llama a CreateStableCoinOperation.buildHederaTransaction()
    return { ...ctx, transaction };
  }
}
```

### Lo que hace `CreateStableCoinOperation.buildHederaTransaction()`:

```typescript
buildHederaTransaction(rawParams): HederaTransaction {
  const params = rawParams as CreateStableCoinParams;
  this.validateParams(params);

  // 1. Monta el TokenStruct con defaults inteligentes
  const struct = this.buildTokenStruct(params);
  //   struct = {
  //     tokenName: 'MyToken', tokenSymbol: 'MTK', tokenDecimals: 6,
  //     freeze: false, supplyType: false, tokenMaxSupply: 0n, tokenInitialSupply: 0n,
  //     reserveAddress: 0x000...0, createReserve: false,
  //     keys: [{ keyType: 17n, ... }, { keyType: 78n, ... }],  // admin+supply, kyc+freeze+wipe+pause
  //     roles: [{ role: BURN_HASH, account: signer }, ...],     // 8 roles al signer
  //     cashinRole: { account: signer, allowance: UINT256_MAX },
  //     businessLogicResolverAddress: resolverAddress,
  //     stableCoinConfigurationId: { key: 0x...02, version: 1 },
  //     reserveConfigurationId: { key: 0x...03, version: 1 },
  //   }

  // 2. Codifica con ethers (porque el struct es complejo — arrays de tuples anidados)
  const iface = new ethers.Interface(FACTORY_ABI);
  const calldata = ethers.getBytes(
    iface.encodeFunctionData('deployStableCoin', [struct])
  );
  // calldata = 0x<4-byte-selector><abi-encoded-struct>  (~2KB de datos)

  // 3. Monta ContractExecuteTransaction apuntando al FACTORY (no al stablecoin)
  return new ContractExecuteTransaction()
    .setContractId(ContractId.fromSolidityAddress(params.factoryAddress))
    .setFunctionParameters(calldata)     // calldata crudo (incluye selector)
    .setGas(4_200_000)                   // gas alto — despliega múltiples contratos
    .setPayableAmount(new Hbar(45));     // 45 HBAR — coste de crear token en Hedera
}
```

**Resultado:** `ctx.transaction` = `ContractExecuteTransaction` lista para firmar

---

## Step 2 — `SignWithClientStep` → `dlt/hedera/steps/SignWithClientStep.ts`

```typescript
export class SignWithClientStep implements ExecutionStep {
  readonly name = 'SignWithClient';

  constructor(private readonly client: Client) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const tx = ctx.transaction;
    // tx = ContractExecuteTransaction del step anterior

    // Freeze: asigna nodeAccountIds y genera el body de la transacción
    const frozen = tx.freezeWith(this.client);

    // Extraer la private key del operador del Client
    const privateKey = this.client._operator.privateKey;

    // Firmar con ECDSA
    const signed = await frozen.sign(privateKey);

    return { ...ctx, signedTransaction: { kind: 'hedera', transaction: signed } };
  }
}
```

**Resultado:** `ctx.signedTransaction` = `{ kind: 'hedera', transaction: <firmada> }`

---

## Step 3 — `SubmitToHederaStep` → `dlt/hedera/steps/SubmitToHederaStep.ts`

```typescript
export class SubmitToHederaStep implements ExecutionStep {
  readonly name = 'SubmitToHedera';

  constructor(private readonly client: Client) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const signed = ctx.signedTransaction as HederaSignedTx;

    // Envía la transacción firmada a la red Hedera
    const response = await signed.transaction.execute(this.client);
    // → POST a los nodos de consensus
    // → El nodo ejecuta el bytecode del factory en la EVM de Hedera
    // → El factory despliega: stablecoin proxy + token HTS + reserve proxy
    // → Tarda ~5-15 segundos

    return { ...ctx, response };
  }
}
```

**Resultado:** `ctx.response` = `TransactionResponse { transactionId, nodeId, ... }`

---

## Step 4 — `ParseHederaReceiptStep` → `dlt/hedera/steps/ParseHederaReceiptStep.ts`

```typescript
export class ParseHederaReceiptStep implements ExecutionStep {
  readonly name = 'ParseHederaReceipt';

  constructor(private readonly client: Client) {}

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    // Espera a que el consensus confirme y devuelve el receipt
    const receipt = await ctx.response.getReceipt(this.client);
    // receipt = { status: SUCCESS, transactionId, contractId, logs, ... }

    return { ...ctx, receipt };
  }
}
```

**Resultado:** `ctx.receipt` = `TransactionReceipt { status, transactionId, logs }`

---

## Step 5 — `ExtractResultStep` → `dlt/shared/ExtractResultStep.ts`

```typescript
export class ExtractResultStep implements ExecutionStep {
  readonly name = 'ExtractResult';

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    const result = ctx.builder.extractResult(ctx.receipt, ctx.params);
    //             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //             Llama a CreateStableCoinOperation.extractResult()
    //             que internamente llama a createResult()
    return { ...ctx, result };
  }
}
```

### Lo que hace `CreateStableCoinOperation.createResult()`:

```typescript
protected createResult(receipt, params): CreateStableCoinResult {
  // Parsea el evento Deployed de los logs del receipt
  if (receipt?.logs) {
    const iface = new ethers.Interface(FACTORY_ABI);
    for (const log of receipt.logs) {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === 'Deployed') {
        return {
          success: true,
          transactionId: receipt.transactionId.toString(),
          proxyAddress:  parsed.args[0].stableCoinProxy,   // dirección del proxy
          tokenAddress:  parsed.args[0].tokenAddress,      // dirección del token HTS
          reserveProxy:  parsed.args[0].reserveProxy,      // dirección del reserve
        };
      }
    }
  }
  return { success: true, transactionId: '...', proxyAddress: '', tokenAddress: '', reserveProxy: '' };
}
```

**Resultado:** `ctx.result` = `{ success: true, transactionId, proxyAddress, tokenAddress, reserveProxy }`

---

## Resumen visual

```
Usuario
  │
  │  sdk.create({ name, symbol, factoryAddress, ... })
  │
  ▼
StableCoin  (fachada pública)
  │
  │  this.orchestrator.execute('create', params)
  │
  ▼
TransactionOrchestrator  (interno)
  │
  ├── operationRegistry.get('create')  →  CreateStableCoinOperation
  ├── prepareContext()                 →  { operationName, params, builder }
  ├── buildPipeline(signing)           →  [Build, Sign, Submit, Parse, Extract]
  │
  ▼
TransactionExecutor.execute(ctx)
  │
  │  ┌─────────────────────┐     ctx.transaction = ContractExecuteTransaction
  ├─►│  1. BuildHederaStep  │     (target: factory, gas: 4.2M, value: 45 HBAR,
  │  └─────────────────────┘      calldata: deployStableCoin(tokenStruct))
  │
  │  ┌──────────────────────┐    ctx.signedTransaction = tx firmada con ECDSA
  ├─►│  2. SignWithClient    │    (freezeWith(client) + sign(privateKey))
  │  └──────────────────────┘
  │
  │  ┌──────────────────────┐    ctx.response = TransactionResponse
  ├─►│  3. SubmitToHedera    │    (tx.execute(client) → red Hedera → EVM)
  │  └──────────────────────┘
  │
  │  ┌──────────────────────┐    ctx.receipt = TransactionReceipt
  ├─►│  4. ParseReceipt      │    (response.getReceipt(client) → consensus)
  │  └──────────────────────┘
  │
  │  ┌──────────────────────┐    ctx.result = { proxyAddress, tokenAddress, ... }
  ├─►│  5. ExtractResult     │    (parsea evento Deployed de los logs)
  │  └──────────────────────┘
  │
  ▼
return ctx.result  →  al usuario
```
