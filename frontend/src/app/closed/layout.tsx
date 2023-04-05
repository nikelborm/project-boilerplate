import type { Metadata } from 'next';

import StyledComponentsRegistry from '../../lib/registry';

export const metadata: Metadata = {
  description: 'Next app closed description',
  viewport: 'width=device-width, initial-scale=1',
};

export default function ClosedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('ClosedLayout');
  return <StyledComponentsRegistry>{children}</StyledComponentsRegistry>;
}
