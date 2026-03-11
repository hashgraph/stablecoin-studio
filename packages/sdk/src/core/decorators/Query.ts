// Map global para registrar query handlers
const queryRegistry = new Map<string, new () => any>();

export function Query(name: string) {
  return function (target: new () => any) {
    if (queryRegistry.has(name)) {
      throw new Error(`Query '${name}' already registered.`);
    }
    queryRegistry.set(name, target);
    return target;
  };
}

export function getRegisteredQueries(): Map<string, new () => any> {
  return new Map(queryRegistry);
}

export function resetQueryRegistry(): void {
  queryRegistry.clear();
}
