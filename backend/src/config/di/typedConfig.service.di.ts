export abstract class DI_TypedConfigService<
  Store extends Record<string, unknown>,
> {
  abstract get<Key extends keyof Store>(propertyPath: Key): Store[Key];

  abstract logToConsole(): void;
}
