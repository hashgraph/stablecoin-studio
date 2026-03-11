import { getRegisteredQueries } from '../decorators/Query.js';

export class QueryHandlerRegistry {
  private handlers = new Map<string, any>();

  constructor() {
    for (const [name, HandlerClass] of getRegisteredQueries()) {
      this.handlers.set(name, new HandlerClass());
    }
  }

  get(query: string): any {
    const handler = this.handlers.get(query);
    if (!handler) {
      throw new Error(`No handler registered for query '${query}'`);
    }
    return handler;
  }

  has(query: string): boolean {
    return this.handlers.has(query);
  }

  getAll(): Map<string, any> {
    return new Map(this.handlers);
  }
}
