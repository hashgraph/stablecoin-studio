import { getRegisteredCommands, resetCommandRegistry } from '../../../core/decorators/Command.js';
import { getRegisteredQueries, resetQueryRegistry } from '../../../core/decorators/Query.js';

// Import all handlers to trigger @Command/@Query registration
import '../../../core/handlers/commands/index.js';
import '../../../core/handlers/queries/index.js';

const EXPECTED_COMMANDS = [
  'pause', 'unpause', 'delete',
  'burn', 'rescue', 'rescueHBAR',
  'freeze', 'unfreeze', 'grantKyc', 'revokeKyc',
  'cashIn', 'wipe', 'transfer',
  'grantRole', 'revokeRole',
  'increaseAllowance', 'decreaseAllowance', 'resetAllowance',
  'grantSupplierRole', 'revokeSupplierRole', 'grantUnlimitedSupplierRole',
  'createHold', 'releaseHold', 'reclaimHold', 'executeHold',
  'updateReserveAddress', 'updateReserveAmount',
  'create',
];

const EXPECTED_QUERIES = [
  'getBalance', 'getBurnableAmount', 'getReserveAddress', 'getReserveAmount',
  'hasRole', 'getRoles', 'getAccountsWithRoles', 'getAllowance', 'isUnlimited',
  'getHeldAmount', 'getHoldCount', 'getHold', 'getHoldsId',
];

describe('Registry Completeness', () => {
  afterAll(() => {
    resetCommandRegistry();
    resetQueryRegistry();
  });

  describe('Command Registry', () => {
    it(`should have all ${EXPECTED_COMMANDS.length} commands registered`, () => {
      const registry = getRegisteredCommands();
      for (const cmd of EXPECTED_COMMANDS) {
        expect(registry.has(cmd)).toBe(true);
      }
    });

    it('should have exactly the expected number of commands', () => {
      const registry = getRegisteredCommands();
      expect(registry.size).toBe(EXPECTED_COMMANDS.length);
    });

    it('should instantiate all command handlers', () => {
      const registry = getRegisteredCommands();
      for (const [name, HandlerClass] of registry) {
        const handler = new HandlerClass();
        expect(handler).toBeDefined();
      }
    });
  });

  describe('Query Registry', () => {
    it(`should have all ${EXPECTED_QUERIES.length} queries registered`, () => {
      const registry = getRegisteredQueries();
      for (const q of EXPECTED_QUERIES) {
        expect(registry.has(q)).toBe(true);
      }
    });

    it('should have exactly the expected number of queries', () => {
      const registry = getRegisteredQueries();
      expect(registry.size).toBe(EXPECTED_QUERIES.length);
    });

    it('should instantiate all query handlers', () => {
      const registry = getRegisteredQueries();
      for (const [name, HandlerClass] of registry) {
        const handler = new HandlerClass();
        expect(handler).toBeDefined();
      }
    });
  });
});
