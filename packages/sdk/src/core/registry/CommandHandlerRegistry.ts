import { getRegisteredCommands } from '../decorators/Command.js';

export class CommandHandlerRegistry {
  private handlers = new Map<string, any>();

  constructor() {
    for (const [name, HandlerClass] of getRegisteredCommands()) {
      this.handlers.set(name, new HandlerClass());
    }
  }

  get(command: string): any {
    const handler = this.handlers.get(command);
    if (!handler) {
      throw new Error(`No handler registered for command '${command}'`);
    }
    return handler;
  }

  has(command: string): boolean {
    return this.handlers.has(command);
  }

  getAll(): Map<string, any> {
    return new Map(this.handlers);
  }
}
