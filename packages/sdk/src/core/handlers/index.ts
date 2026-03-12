// Base classes
export { BaseCommandHandler } from './BaseCommandHandler.js';
export { BaseQueryHandler } from './BaseQueryHandler.js';
export { BaseCompositeHandler, type SubCommand } from './BaseCompositeHandler.js';

// Types
export * from './types.js';

// All command handlers (imports force @Command registration)
export * from './commands/index.js';

// All query handlers (imports force @Query registration)
export * from './queries/index.js';
