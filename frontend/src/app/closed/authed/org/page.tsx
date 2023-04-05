import { DebugLinks } from '@/app/components/DebugLinks';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizer page',
};

export default function Organizer() {
  return (
    <main>
      <div>This is Organizer</div>
      <DebugLinks />
    </main>
  );
}
