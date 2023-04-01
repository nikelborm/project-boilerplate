import { Metadata } from 'next';

import StyledComponentsRegistry from '../../lib/registry';

export const metadata: Metadata = {
  description: 'Next app public description',
  viewport: 'width=device-width, initial-scale=1',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('PublicLayout');
  return <StyledComponentsRegistry>{children}</StyledComponentsRegistry>;
}
