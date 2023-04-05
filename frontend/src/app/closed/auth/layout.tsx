import type { AuthTokenPairDTO } from '@/types';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '@/types';
import cookieParser from 'cookie-parser';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const tokenPair = parseAndValidateTokenPairCookies(cookieStore);
  if (tokenPair.typename === 'error')
    return (
      <>
        <div>error: {tokenPair.error}</div>
        {children}
      </>
    );
  console.log('AuthLayout');

  return (
    <>
      <div>
        <p>accessToken: {tokenPair.accessToken}</p>
        <p>refreshToken: {tokenPair.refreshToken}</p>
      </div>
      {children}
    </>
  );
}

function parseAndValidateTokenPairCookies(
  cookieStore: ReturnType<typeof cookies>,
):
  | ({ typename: 'tokenPair' } & AuthTokenPairDTO)
  | { typename: 'error'; error: string } {
  const accessJwtCookieWithSignature = cookieStore.get(
    ACCESS_TOKEN_COOKIE_NAME as string,
  );
  const refreshJwtCookieWithSignature = cookieStore.get(
    REFRESH_TOKEN_COOKIE_NAME as string,
  );

  if (
    !accessJwtCookieWithSignature ||
    !refreshJwtCookieWithSignature ||
    !accessJwtCookieWithSignature.value ||
    !refreshJwtCookieWithSignature.value
  )
    return {
      typename: 'error',
      error: 'not authed: access or refresh cookie token is missing',
    };

  if (
    !accessJwtCookieWithSignature.value.startsWith('s:') ||
    !refreshJwtCookieWithSignature.value.startsWith('s:')
  )
    return {
      typename: 'error',
      error: 'not authed: access or refresh cookie is unsigned',
    };

  const validUnsignedAccessJWT = cookieParser.signedCookie(
    accessJwtCookieWithSignature.value,
    process.env.COOKIE_SIGN_KEY,
  );

  const validUnsignedRefreshJWT = cookieParser.signedCookie(
    refreshJwtCookieWithSignature.value,
    process.env.COOKIE_SIGN_KEY,
  );

  if (
    !validUnsignedAccessJWT ||
    !validUnsignedRefreshJWT ||
    // https://github.com/expressjs/cookie-parser#cookieparsersignedcookiestr-secret
    // https://github.com/expressjs/cookie-parser/issues/70
    validUnsignedRefreshJWT === refreshJwtCookieWithSignature.value ||
    validUnsignedAccessJWT === accessJwtCookieWithSignature.value
  )
    return {
      typename: 'error',
      error:
        'not authed: access or refresh cookie have wrong signature or unsigned',
    };

  verify(validUnsignedAccessJWT, process.env.COOKIE_SIGN_KEY);

  return {
    typename: 'tokenPair',
    accessToken: validUnsignedAccessJWT,
    refreshToken: validUnsignedRefreshJWT,
  };
}
