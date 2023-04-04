import { NotEquals, ValidateIf } from 'class-validator';
import { combineDecorators } from '../combineDecorators';

export function AllowToBeNullButFailIfNotDefinedOrEqualsUndefined(): PropertyDecorator {
  return (target, propertyKey) =>
    combineDecorators(
      // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
      ValidateIf((dto) => dto[propertyKey] !== null),
      NotEquals(undefined), // Fails if equals undefined or propertyKey not in object keys
    )(target, propertyKey);
}

export function AllowToBeNotDefinedOrDefinedAsNullButFailIfEqualsUndefined(): PropertyDecorator {
  return (target, propertyKey) =>
    combineDecorators(
      ValidateIf(
        (dto) =>
          !(
            /* skip validation if property not set */
            (
              !(propertyKey in dto) ||
              /* skip validation if property is null */
              // eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-unsafe-member-access
              dto[propertyKey] === null
            )
          ),
      ),
      NotEquals(undefined), // Fails if equals undefined but it will not fail if not defined because ValidateIf will skip validation when propertyKey not in object keys
    )(target, propertyKey);
}
