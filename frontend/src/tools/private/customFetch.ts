import { API_PATH } from '@/constant';

// eslint-disable-next-line import/no-cycle
import { authStore } from './authStore';
import { validate } from '../shared/validate';

export function customFetch<
  const TRequest,
  const TOptions extends {
    needsJsonResponseBodyParsing: false;
  } & CustomFetchOptionsBase<TRequest>,
>(target: RequestInfo, customFetchOptions: TOptions): Promise<Response>;

export function customFetch<
  const TRequest,
  const TOptions extends {
    needsJsonResponseBodyParsing: true;
    responseDTOClass?: (new () => Record<string, any>) | undefined;
  } & CustomFetchOptionsBase<TRequest>,
>(
  target: RequestInfo,
  customFetchOptions: TOptions,
): Promise<
  keyof TOptions extends Exclude<keyof TOptions, 'responseDTOClass'>
    ? Record<string, any> // 'responseDTOClass' not in customFetchOptions
    : TOptions extends { responseDTOClass: new () => infer TResponse }
    ? TResponse
    : Record<string, any> //  customFetchOptions['responseDTOClass'] is undefined
>;

export async function customFetch<
  TRequest,
  const TOptions extends CustomFetchOptionsBase<TRequest> & {
    needsJsonResponseBodyParsing: boolean;
    responseDTOClass?: new () => Record<string, any>;
  },
>(
  target: RequestInfo,
  {
    method,
    headers,
    body,
    params,
    needsAccessToken = true,
    needsJsonResponseBodyParsing,
    requestDTOclass,
    responseDTOClass,
    baseUrl = API_PATH, // Project-specific
  }: TOptions,
): CustomFetchResponse<FetchReturnType<TRequest, TOptions>> {
  const nextHeaders: HeadersInit = { ...headers };

  const options: RequestInit = {};

  if (method && method !== 'GET') {
    options.method = method;
    if (method !== 'DELETE') {
      nextHeaders['Content-Type'] = 'application/json';
    }
  }

  if (body) {
    if (requestDTOclass) {
      const { errors, payloadInstance } = validate(body, requestDTOclass);
      if (errors.length) {
        // eslint-disable-next-line no-console
        console.error([payloadInstance, errors]);
        throw new Error(
          `Validation error: request body schema does not match DTO schema: ${JSON.stringify(
            [payloadInstance, errors],
          )}`,
        );
      }
    }
    options.body = JSON.stringify(body);
  }

  if (needsAccessToken) {
    nextHeaders.authorization = await authStore.getAuthHeader();
  }

  options.headers = new Headers(nextHeaders);

  const urlToFetch = new URL(`${baseUrl}${target.toString()}`);
  const urlParamsAdditional = new URLSearchParams(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    JSON.parse(JSON.stringify(params ?? {})), // JSON to remove undefined values
  );

  const urlParamsAdditionalStringified = urlParamsAdditional.toString();

  if (urlParamsAdditionalStringified) {
    urlToFetch.search = urlToFetch.search
      ? `${urlToFetch.search}&${urlParamsAdditionalStringified}`
      : urlParamsAdditionalStringified;
  }

  const responseData = await fetch(urlToFetch.href, options).then(
    getResponseParsingFn(needsJsonResponseBodyParsing, responseDTOClass) as (
      r: Response,
    ) => FetchReturnType<TRequest, TOptions>,
  );

  return responseData;
}

type FetchReturnType<
  TRequest,
  TOptions extends CustomFetchOptionsBase<TRequest> & {
    needsJsonResponseBodyParsing: boolean;
    responseDTOClass?: new () => Record<string, any>;
  },
> = Promise<
  [TOptions['needsJsonResponseBodyParsing']] extends [true]
    ? Response
    : keyof TOptions extends Exclude<keyof TOptions, 'responseDTOClass'>
    ? Record<string, any> // 'responseDTOClass' not in customFetchOptions
    : TOptions extends { responseDTOClass: new () => infer TResponse }
    ? TResponse
    : Record<string, any> //  customFetchOptions['responseDTOClass'] is undefined
>;

function getResponseParsingFn(
  shouldParseJsonBody: boolean,
  validationModelDTO?: new () => Record<string, any>,
) {
  if (shouldParseJsonBody === false) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return async (response) => await Promise.resolve(response);
  }

  return async (res: Response) => {
    const parsed = (await res.json()) as Record<string, any>;

    if (!res.ok) throw new Error((await res.text()) ?? res.statusText);

    if (!validationModelDTO) return parsed;

    const { errors, payloadInstance } = validate(parsed, validationModelDTO);

    if (errors.length) {
      // eslint-disable-next-line no-console
      console.error([payloadInstance, errors]);
      throw new Error(
        `Validation error: response body schema does not match DTO schema: ${JSON.stringify(
          [payloadInstance, errors],
        )}`,
      );
    }

    return payloadInstance;
  };
}

type CustomFetchOptionsBase<TRequest> = {
  method?: string;
  headers?: object;
  body?: TRequest;
  params?: Record<string, string | number | boolean>;
  needsAccessToken?: boolean;
  baseUrl?: string;
  requestDTOclass?: new () => TRequest;
};

type CustomFetchResponse<TResponse> = Promise<
  Response | Record<string, any> | TResponse
>;
