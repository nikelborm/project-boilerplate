import { DebugLinks } from '@/app/components/DebugLinks';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin page',
};

export default function Admin() {
  return (
    <main>
      <div>This is Admin</div>
      <DebugLinks />
    </main>
  );
}
