'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    // @ts-expect-error types of @types/styled-components delay from original styled-components library
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    styledComponentsStyleSheet.instance.clearTag();
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{styles}</>;
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (typeof window !== 'undefined') return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
