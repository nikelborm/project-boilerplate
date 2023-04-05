import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  description: 'Next app root description',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('RootLayout');
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
