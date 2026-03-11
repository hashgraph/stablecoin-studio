// Map global para registrar command handlers
const commandRegistry = new Map<string, new () => any>();

export function Command(name: string) {
  return function (target: new () => any) {
    if (commandRegistry.has(name)) {
      throw new Error(`Command '${name}' already registered.`);
    }
    commandRegistry.set(name, target);
    return target;
  };
}

export function getRegisteredCommands(): Map<string, new () => any> {
  return new Map(commandRegistry);
}

export function resetCommandRegistry(): void {
  commandRegistry.clear();
}
