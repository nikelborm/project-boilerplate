// taken from
// https://github.com/nestjs/nest/blob/master/packages/common/decorators/core/apply-decorators.ts
// because i don't want to move entire library into shared space for only one utility function

/**
 * Function that returns a new decorator that applies all decorators provided by param
 *
 * Useful to build new decorators (or a decorator factory) encapsulating multiple decorators related with the same feature
 *
 * @param decorators one or more decorators (e.g., `ApplyGuard(...)`)
 *
 * @publicApi
 */
export function combineDecorators(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>,
  ): void => {
    for (const decorator of decorators) {
      if (target instanceof Function && !descriptor) {
        (decorator as ClassDecorator)(target);
        // eslint-disable-next-line no-continue
        continue;
      }
      (decorator as MethodDecorator | PropertyDecorator)(
        target,
        // @ts-expect-error i don't understand error here, and leave it on the nest developer's shoulders
        propertyKey,
        descriptor,
      );
    }
  };
}
