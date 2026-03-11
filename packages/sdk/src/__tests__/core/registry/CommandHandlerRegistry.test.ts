import {
  Command,
  resetCommandRegistry,
} from '../../../core/decorators/Command.js';
import {
  Query,
  resetQueryRegistry,
} from '../../../core/decorators/Query.js';
import { CommandHandlerRegistry } from '../../../core/registry/CommandHandlerRegistry.js';
import { QueryHandlerRegistry } from '../../../core/registry/QueryHandlerRegistry.js';

// ── CommandHandlerRegistry tests ──────────────────────────────────────────────

describe('CommandHandlerRegistry', () => {
  beforeEach(() => {
    resetCommandRegistry();
  });

  afterEach(() => {
    resetCommandRegistry();
  });

  it('creates instances of all registered command handlers on construction', () => {
    let constructorCalled = 0;

    @Command('createToken')
    class CreateTokenHandler {
      constructor() { constructorCalled++; }
      async execute() { return { success: true }; }
    }

    @Command('mintToken')
    class MintTokenHandler {
      constructor() { constructorCalled++; }
      async execute() { return { success: true }; }
    }

    const registry = new CommandHandlerRegistry();

    expect(constructorCalled).toBe(2);
    expect(registry.has('createToken')).toBe(true);
    expect(registry.has('mintToken')).toBe(true);
  });

  it('registry.get(name) returns the correct handler instance', () => {
    @Command('burnToken')
    class BurnTokenHandler {
      burn() { return 'burned'; }
    }

    const registry = new CommandHandlerRegistry();
    const handler = registry.get('burnToken');

    expect(handler).toBeInstanceOf(BurnTokenHandler);
    expect(handler.burn()).toBe('burned');
  });

  it('registry.get(nonexistent) throws a descriptive error', () => {
    const registry = new CommandHandlerRegistry();

    expect(() => registry.get('nonExistentCommand')).toThrow(
      "No handler registered for command 'nonExistentCommand'"
    );
  });

  it('registry.has(name) returns true for registered commands', () => {
    @Command('wipeToken')
    class WipeTokenHandler {}

    const registry = new CommandHandlerRegistry();

    expect(registry.has('wipeToken')).toBe(true);
  });

  it('registry.has(name) returns false for unregistered commands', () => {
    const registry = new CommandHandlerRegistry();

    expect(registry.has('doesNotExist')).toBe(false);
  });

  it('registry.getAll() returns a map with all registered handlers', () => {
    @Command('transferToken')
    class TransferTokenHandler {}

    @Command('pauseToken')
    class PauseTokenHandler {}

    const registry = new CommandHandlerRegistry();
    const all = registry.getAll();

    expect(all.size).toBe(2);
    expect(all.has('transferToken')).toBe(true);
    expect(all.has('pauseToken')).toBe(true);
  });

  it('registry.getAll() returns a copy (mutations do not affect the registry)', () => {
    @Command('freezeToken')
    class FreezeTokenHandler {}

    const registry = new CommandHandlerRegistry();
    const copy = registry.getAll();
    copy.delete('freezeToken');

    // Internal registry unaffected
    expect(registry.has('freezeToken')).toBe(true);
  });

  it('registry is empty when no commands are registered', () => {
    const registry = new CommandHandlerRegistry();

    expect(registry.getAll().size).toBe(0);
  });

  it('each call to new CommandHandlerRegistry() creates fresh instances', () => {
    const instances: any[] = [];

    @Command('grantKyc')
    class GrantKycHandler {
      constructor() { instances.push(this); }
    }

    new CommandHandlerRegistry();
    new CommandHandlerRegistry();

    expect(instances).toHaveLength(2);
    expect(instances[0]).not.toBe(instances[1]);
  });
});

// ── QueryHandlerRegistry tests ────────────────────────────────────────────────

describe('QueryHandlerRegistry', () => {
  beforeEach(() => {
    resetQueryRegistry();
  });

  afterEach(() => {
    resetQueryRegistry();
  });

  it('creates instances of all registered query handlers on construction', () => {
    let constructorCalled = 0;

    @Query('getTokenInfo')
    class GetTokenInfoHandler {
      constructor() { constructorCalled++; }
      async execute() { return {}; }
    }

    @Query('getBalance')
    class GetBalanceHandler {
      constructor() { constructorCalled++; }
      async execute() { return {}; }
    }

    const registry = new QueryHandlerRegistry();

    expect(constructorCalled).toBe(2);
    expect(registry.has('getTokenInfo')).toBe(true);
    expect(registry.has('getBalance')).toBe(true);
  });

  it('registry.get(name) returns the correct handler instance', () => {
    @Query('getSupply')
    class GetSupplyHandler {
      query() { return 1000; }
    }

    const registry = new QueryHandlerRegistry();
    const handler = registry.get('getSupply');

    expect(handler).toBeInstanceOf(GetSupplyHandler);
    expect(handler.query()).toBe(1000);
  });

  it('registry.get(nonexistent) throws a descriptive error', () => {
    const registry = new QueryHandlerRegistry();

    expect(() => registry.get('nonExistentQuery')).toThrow(
      "No handler registered for query 'nonExistentQuery'"
    );
  });

  it('registry.has(name) returns true for registered queries', () => {
    @Query('getHolders')
    class GetHoldersHandler {}

    const registry = new QueryHandlerRegistry();

    expect(registry.has('getHolders')).toBe(true);
  });

  it('registry.has(name) returns false for unregistered queries', () => {
    const registry = new QueryHandlerRegistry();

    expect(registry.has('doesNotExist')).toBe(false);
  });

  it('registry.getAll() returns a map with all registered handlers', () => {
    @Query('getTokenList')
    class GetTokenListHandler {}

    @Query('getTokenDetails')
    class GetTokenDetailsHandler {}

    const registry = new QueryHandlerRegistry();
    const all = registry.getAll();

    expect(all.size).toBe(2);
    expect(all.has('getTokenList')).toBe(true);
    expect(all.has('getTokenDetails')).toBe(true);
  });

  it('registry.getAll() returns a copy (mutations do not affect the registry)', () => {
    @Query('getReserve')
    class GetReserveHandler {}

    const registry = new QueryHandlerRegistry();
    const copy = registry.getAll();
    copy.delete('getReserve');

    expect(registry.has('getReserve')).toBe(true);
  });

  it('registry is empty when no queries are registered', () => {
    const registry = new QueryHandlerRegistry();

    expect(registry.getAll().size).toBe(0);
  });
});
