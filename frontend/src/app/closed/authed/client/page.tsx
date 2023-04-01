import { DebugLinks } from '@/app/components/DebugLinks';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client page',
};

export default function Client() {
  return (
    <main>
      <div>This is Client</div>
      <DebugLinks />
    </main>
  );
}
