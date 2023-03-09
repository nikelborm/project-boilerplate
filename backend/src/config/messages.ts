import { pluralForm, startsWithCapital } from 'src/tools';

const messagesRepeating = {
  notEnoughAccess: 'Not enough access level to',
  moreThanOne: "There's more than one",
  validationError: 'Validation error:',
};

const rawMessages = {
  auth: {
    incorrectUser: 'User with this email was not found',
    incorrectPassword: 'Incorrect password',
    userHasNoAccessScopes:
      'This user has no access scopes. The user is not assigned to any access scope and has no additional role. Please contact the administrator',
    developmentOnly: 'Development only',
    unauthorizedOnly: 'You should not be authorized to use this route',
    missingAuthHeader: 'Missing Authorization header (with Token)',
    incorrectTokenType: 'Token type should be Bearer',
    missingToken: `Missing Token in Authorization header`,
    invalidAccessToken:
      'Access token in Authorization header is not a valid JWT token',
    invalidRefreshToken: 'Refresh token you provided is not a valid JWT token',
    accessTokenExpired:
      'Access token in Authorization header has been expired. Refresh it with refresh token',
    yourSessionWasFinished:
      'Your session was finished because of long inactivity.\nIf you used your account less than a week ago, your account can be hacked.\nPlease open your settings and click the "Logout on all devices" button',
  },
  user: {
    exists: 'User with this email already exists',
    cantGetNotFoundByEmail: (email: string): string =>
      `User with email={${email}} was not found`,
  },

  accessScope: {
    notSingleAdminScope: `${messagesRepeating.moreThanOne} Admin access scope in the database`,
    notSingleSuperAdminScope: `${messagesRepeating.moreThanOne} Super Admin access scope in the database`,
    cannotPromoteYourself: 'Cannot set additional role for yourself',
  },
  types: {
    shouldBeDate: 'Validation failed. Date should be in ISO format',
  },
  repo: {
    common: {
      // Entity name should always be at the end of the function
      cantCreateWithId: (entity: any, entityName?: string): string =>
        `Can\`t create an ${
          entityName || 'entity'
        }: there's an id specified where it should not be. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantCreateWithIds: (entities: any[], entityName?: string): string =>
        `Can\`t create ${pluralForm(
          entityName || 'entity',
        )}: there are ids specified where they should not be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantUpdateWithoutId: (entity: any, entityName?: string): string =>
        `Can\`t update an ${
          entityName || 'entity'
        }: there is no id specified where it should. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantUpdateWithoutIds: (entities: any[], entityName?: string): string =>
        `Can\`t update an ${pluralForm(
          entityName || 'entity',
        )}: there are no ids specified where they should be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantDeleteWithoutId: (entity: any, entityName?: string): string =>
        `Can\`t delete an ${
          entityName || 'entity'
        }: there is no id specified where it should be. JSON: ${JSON.stringify(
          entity,
        )}`,
      cantDeleteWithoutIds: (entities: any[], entityName?: string): string =>
        `Can\`t delete an ${pluralForm(
          entityName || 'entity',
        )}: there is no id specified where it should be. JSON: ${JSON.stringify(
          entities,
        )}`,
      cantGetNotFoundById: (id: number, entityName?: string): string =>
        `${startsWithCapital(
          entityName || 'entity',
        )} with id={${id}} was not found`,
      cantGetNotFoundByUUID: (uuid: string, entityName?: string): string =>
        `${startsWithCapital(
          entityName || 'entity',
        )} with uuid={${uuid}} was not found`,
      cantUpdateOneNotFound: (id: number, entityName?: string): string =>
        `Cannot update ${
          entityName || 'entity'
        } with id={${id}}, because it does not exist`,
      cantUpdateManyNotFound: (
        wantedToUpdateEntityIds: number[],
        notExistingEntityIds: number[],
        entityName?: string,
      ): string =>
        `Cannot update ${pluralForm(
          entityName || 'entity',
        )} with ids={${wantedToUpdateEntityIds.join()}}, because some ${
          entityName || 'entity'
        }s with ids={${notExistingEntityIds.join()}} does not exist`,
      cantCreateOne: (newEntity: any, entityName?: string): string =>
        `Unable to create new ${entityName || 'entity'} JSON: {${JSON.stringify(
          newEntity,
        )}}`,
      cantCreateMany: (newEntities: any[], entityName?: string): string =>
        `Unable to insert ${pluralForm(
          entityName || 'entity',
        )}. JSON: {${JSON.stringify(newEntities)}}`,
    } as const,
  } as const,
} as const;

// eslint-disable-next-line @typescript-eslint/ban-types
function buildProxy<
  AllowedEntities extends string,
  T extends typeof rawMessages,
  ReturnType extends Omit<T, 'repo'> & {
    repo: MessagesDotRepoType<T, AllowedEntities>;
  },
>(messages: T, allowedEntities: Set<AllowedEntities>): ReturnType {
  return new Proxy(messages, {
    get(messagesTarget, messagesProp, messagesReceiver): any {
      if (messagesProp !== 'repo')
        return Reflect.get(messagesTarget, messagesProp, messagesReceiver);

      return new Proxy(Reflect.get(messagesTarget, 'repo', messagesReceiver), {
        get(messagesRepoTarget, possiblyEntityName, messagesRepoReceiver): any {
          const possiblyCommonObject = Reflect.get(
            messagesRepoTarget,
            possiblyEntityName,
            messagesRepoReceiver,
          );
          if (
            possiblyEntityName === 'common' ||
            !allowedEntities.has(possiblyEntityName as AllowedEntities)
          )
            return possiblyCommonObject;
          return new Proxy(
            Reflect.get(messagesRepoTarget, 'common', messagesRepoReceiver),
            {
              get(
                messagesRepoCommonTarget,
                messagesRepoCommonMethodName,
                messagesRepoCommonReceiver,
              ): any {
                const possiblyFunc = Reflect.get(
                  messagesRepoCommonTarget,
                  messagesRepoCommonMethodName,
                  messagesRepoCommonReceiver,
                );
                if (typeof possiblyFunc !== 'function') return possiblyFunc;
                return new Proxy(possiblyFunc, {
                  apply(methodTarget, thisArg, args): any {
                    return Reflect.apply(methodTarget, thisArg, [
                      ...args,
                      possiblyEntityName,
                    ]);
                  },
                });
              },
            },
          ) as unknown;
        },
      });
    },
  }) as unknown as ReturnType;
}

export const messages = buildProxy(
  rawMessages,
  new Set(['user', 'reservoir'] as const),
);

type MessagesDotRepoType<
  T extends typeof rawMessages,
  AllowedEntities extends string,
> = {
  common: T['repo']['common'];
} & MessagesDotRepoDotNotCommonType<T, AllowedEntities>;

type MessagesDotRepoDotNotCommonType<
  T extends typeof rawMessages,
  AllowedEntities extends string,
  RepoCommon extends T['repo']['common'] = T['repo']['common'],
> = {
  [entityName in AllowedEntities]: {
    [MethodName in keyof RepoCommon]: RepoCommon[MethodName] extends (
      ...args: [...infer FunctionArgumentsExceptEntityNameAtTheEnd, any]
    ) => any
      ? (...args: FunctionArgumentsExceptEntityNameAtTheEnd) => string
      : never;
  };
};
