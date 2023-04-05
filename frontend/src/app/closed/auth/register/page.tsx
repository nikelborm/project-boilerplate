import { DebugLinks } from '@/app/components/DebugLinks';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register page',
};

export default function Register() {
  return (
    <main>
      <div>This is Register</div>
      <DebugLinks />
    </main>
  );
}
