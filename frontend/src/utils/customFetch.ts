import { API_PATH } from 'constant';
// eslint-disable-next-line import/no-cycle
import { authStore } from './authStore';

interface CustomFetchOptions {
  method?: string;
  headers?: object;
  body?: object;
  params?: Record<string, string | number | boolean>;
  needsAccessToken?: boolean;
  needsParsing?: boolean;
  baseUrl?: string;
}

export async function customFetch<TResponse>(
  target: RequestInfo,
  {
    method,
    headers,
    body,
    params,
    needsAccessToken = true,
    needsParsing = true,
    baseUrl = API_PATH, // Project-specific
  }: CustomFetchOptions = {},
) {
  const nextHeaders: HeadersInit = { ...headers };

  const options: RequestInit = {};

  if (method && method !== 'GET') {
    options.method = method;
    if (method !== 'DELETE') {
      nextHeaders['Content-Type'] = 'application/json';
    }
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (needsAccessToken) {
    nextHeaders.authorization = await authStore.getAuthHeader();
  }

  options.headers = new Headers(nextHeaders);

  const urlToFetch = new URL(`${baseUrl}${target}`);
  const urlParamsAdditional = new URLSearchParams(
    JSON.parse(JSON.stringify(params ?? {})), // JSON to remove undefined values
  );

  const urlParamsAdditionalStringified = urlParamsAdditional.toString();

  if (urlParamsAdditionalStringified) {
    urlToFetch.search = urlToFetch.search
      ? `${urlToFetch.search}&${urlParamsAdditionalStringified}`
      : urlParamsAdditionalStringified;
  }

  const responseData = await fetch(urlToFetch.href, options).then(
    needsParsing ? parseJSONResponse : (response) => response,
  );

  return responseData as TResponse;
}

async function parseJSONResponse(res: Response) {
  const parsed = await res.json();

  if (res.ok) return parsed;

  throw parsed ?? res.statusText;
}
