import {
  Command,
  getRegisteredCommands,
  resetCommandRegistry,
} from '../../../core/decorators/Command.js';
import {
  Query,
  getRegisteredQueries,
  resetQueryRegistry,
} from '../../../core/decorators/Query.js';

// ── Command decorator tests ────────────────────────────────────────────────────

describe('Command decorator', () => {
  beforeEach(() => {
    resetCommandRegistry();
  });

  afterEach(() => {
    resetCommandRegistry();
  });

  it('registers a class in the command registry when decorated', () => {
    @Command('createToken')
    class CreateTokenHandler {
      execute() { return { success: true }; }
    }

    const registry = getRegisteredCommands();
    expect(registry.has('createToken')).toBe(true);
    expect(registry.get('createToken')).toBe(CreateTokenHandler);
  });

  it('throws when registering the same command name twice', () => {
    @Command('mintToken')
    class MintTokenHandler {}

    expect(() => {
      @Command('mintToken')
      class DuplicateMintHandler {}
    }).toThrow("Command 'mintToken' already registered.");
  });

  it('resetCommandRegistry() clears all registered commands', () => {
    @Command('burnToken')
    class BurnTokenHandler {}

    expect(getRegisteredCommands().size).toBe(1);

    resetCommandRegistry();

    expect(getRegisteredCommands().size).toBe(0);
  });

  it('getRegisteredCommands() returns all registered classes', () => {
    @Command('transferToken')
    class TransferTokenHandler {}

    @Command('wipeToken')
    class WipeTokenHandler {}

    const registry = getRegisteredCommands();
    expect(registry.size).toBe(2);
    expect(registry.get('transferToken')).toBe(TransferTokenHandler);
    expect(registry.get('wipeToken')).toBe(WipeTokenHandler);
  });

  it('getRegisteredCommands() returns a copy (mutations do not affect the internal registry)', () => {
    @Command('pauseToken')
    class PauseTokenHandler {}

    const copy = getRegisteredCommands();
    copy.delete('pauseToken');

    // Internal registry is unaffected
    const second = getRegisteredCommands();
    expect(second.has('pauseToken')).toBe(true);
  });

  it('decorated class is still usable as a normal class', () => {
    @Command('freezeToken')
    class FreezeTokenHandler {
      execute() { return 'frozen'; }
    }

    const instance = new FreezeTokenHandler();
    expect(instance.execute()).toBe('frozen');
  });
});

// ── Query decorator tests ──────────────────────────────────────────────────────

describe('Query decorator', () => {
  beforeEach(() => {
    resetQueryRegistry();
  });

  afterEach(() => {
    resetQueryRegistry();
  });

  it('registers a class in the query registry when decorated', () => {
    @Query('getTokenInfo')
    class GetTokenInfoHandler {
      execute() { return {}; }
    }

    const registry = getRegisteredQueries();
    expect(registry.has('getTokenInfo')).toBe(true);
    expect(registry.get('getTokenInfo')).toBe(GetTokenInfoHandler);
  });

  it('throws when registering the same query name twice', () => {
    @Query('getBalance')
    class GetBalanceHandler {}

    expect(() => {
      @Query('getBalance')
      class DuplicateGetBalanceHandler {}
    }).toThrow("Query 'getBalance' already registered.");
  });

  it('resetQueryRegistry() clears all registered queries', () => {
    @Query('getSupply')
    class GetSupplyHandler {}

    expect(getRegisteredQueries().size).toBe(1);

    resetQueryRegistry();

    expect(getRegisteredQueries().size).toBe(0);
  });

  it('getRegisteredQueries() returns all registered classes', () => {
    @Query('getTokenList')
    class GetTokenListHandler {}

    @Query('getTokenDetails')
    class GetTokenDetailsHandler {}

    const registry = getRegisteredQueries();
    expect(registry.size).toBe(2);
    expect(registry.get('getTokenList')).toBe(GetTokenListHandler);
    expect(registry.get('getTokenDetails')).toBe(GetTokenDetailsHandler);
  });

  it('getRegisteredQueries() returns a copy (mutations do not affect the internal registry)', () => {
    @Query('getHolders')
    class GetHoldersHandler {}

    const copy = getRegisteredQueries();
    copy.delete('getHolders');

    const second = getRegisteredQueries();
    expect(second.has('getHolders')).toBe(true);
  });

  it('decorated class is still usable as a normal class', () => {
    @Query('getReserve')
    class GetReserveHandler {
      execute() { return 42; }
    }

    const instance = new GetReserveHandler();
    expect(instance.execute()).toBe(42);
  });
});

// ── Isolation: Command and Query registries are independent ───────────────────

describe('Command and Query registry isolation', () => {
  beforeEach(() => {
    resetCommandRegistry();
    resetQueryRegistry();
  });

  afterEach(() => {
    resetCommandRegistry();
    resetQueryRegistry();
  });

  it('Command and Query registries are independent from each other', () => {
    @Command('doSomething')
    class DoSomethingHandler {}

    @Query('getSomething')
    class GetSomethingHandler {}

    expect(getRegisteredCommands().has('doSomething')).toBe(true);
    expect(getRegisteredCommands().has('getSomething')).toBe(false);

    expect(getRegisteredQueries().has('getSomething')).toBe(true);
    expect(getRegisteredQueries().has('doSomething')).toBe(false);
  });

  it('resetting one registry does not affect the other', () => {
    @Command('cmd1')
    class Cmd1Handler {}

    @Query('qry1')
    class Qry1Handler {}

    resetCommandRegistry();

    expect(getRegisteredCommands().size).toBe(0);
    expect(getRegisteredQueries().size).toBe(1);
  });
});
