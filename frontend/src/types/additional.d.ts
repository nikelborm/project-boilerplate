/// <reference types="node" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="react" />
/// <reference types="react-dom" />

type Styles = Record<string, string>;

// https://dev.to/krzysztofzuraw/how-to-type-nextjs-env-variables-in-typescript-50cg
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';
    readonly PUBLIC_URL: string;
    readonly COOKIE_SIGN_KEY: string;
    readonly AUTH_JWT_SECRET: string;
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import type * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
