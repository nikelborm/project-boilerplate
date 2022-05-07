import { pluralForm, startsWithCapital } from 'src/tools';

const messagesRepeating = {
  notEnoughAccess: 'Not enough access level to',
  moreThanOne: "There's more than one",
  validationError: 'Validation error:',
};

export const messages = {
  auth: {
    incorrectUser: 'User with this email was not found',
    incorrectPassword: 'Incorrect password',
    userHasNoAccessScopes:
      'This user has no access scopes. The user is not assigned to any access scope and has no additional role. Please contact the administrator',
    developmentOnly: 'Development only',
    missingAuthHeader: 'Missing Authorization header (with Token)',
    incorrectTokenType: 'Token type should be Bearer',
    missingToken: `Missing Token in Authorization header`,
    invalidToken:
      'Token in Authorization header is not a valid JWT token, try requesting a new one',
  },
  user: {
    exists: 'User with this email already exists',
  },
  accessScope: {
    notSingleAdminScope: `${messagesRepeating.moreThanOne} Admin access scope in the database`,
    notSingleSuperAdminScope: `${messagesRepeating.moreThanOne} Super Admin access scope in the database`,
    cannotPromoteYourself: 'Cannot set additional role for yourself',
  },
  repo: {
    common: {
      cantCreateWithId: (entity: any, entityName?: string) =>
        `Can\`t create an ${
          entityName || 'entity'
        }: there's an id specified where it should not be. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantCreateWithIds: (entities: any[], entityName?: string) =>
        `Can\`t create ${pluralForm(
          entityName || 'entity',
        )}: there are ids specified where they should not be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantUpdateWithoutId: (entity: any, entityName?: string) =>
        `Can\`t update an ${
          entityName || 'entity'
        }: there is no id specified where it should. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantUpdateWithoutIds: (entities: any[], entityName?: string) =>
        `Can\`t update an ${pluralForm(
          entityName || 'entity',
        )}: there are no ids specified where they should be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantDeleteWithoutId: (entity: any, entityName?: string) =>
        `Can\`t delete an ${
          entityName || 'entity'
        }: there is no id specified where it should be. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantDeleteWithoutIds: (entities: any[], entityName?: string) =>
        `Can\`t delete an ${pluralForm(
          entityName || 'entity',
        )}: there is no id specified where it should be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantGetNotFoundById: (id: number, entityName?: string) =>
        `${startsWithCapital(
          entityName || 'entity',
        )} with id={${id}} was not found`,
      cantGetNotFoundByUUID: (uuid: string, entityName?: string) =>
        `${startsWithCapital(
          entityName || 'entity',
        )} with uuid={${uuid}} was not found`,
      cantUpdateOneNotFound: (id: number, entityName?: string) =>
        `Cannot update ${
          entityName || 'entity'
        } with id={${id}}, because it does not exist`,
      cantUpdateManyNotFound: (
        wantedToUpdateEntityIds: number[],
        notExistingEntityIds: number[],
        entityName?: string,
      ) =>
        `Cannot update ${pluralForm(
          entityName || 'entity',
        )} with ids={${wantedToUpdateEntityIds.join()}}, because some ${
          entityName || 'entity'
        }s with ids={${notExistingEntityIds.join()}} does not exist`,
      cantCreateOne: (newEntity: any, entityName?: string) =>
        `Unable to create new ${entityName || 'entity'} JSON: {${JSON.stringify(
          newEntity,
        )}}`,
      cantCreateMany: (newEntities: any[], entityName?: string) =>
        `Unable to insert ${pluralForm(
          entityName || 'entity',
        )}. JSON: {${JSON.stringify(newEntities)}}`,
    },
  },
};
