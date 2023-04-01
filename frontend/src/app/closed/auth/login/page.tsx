import { DebugLinks } from '@/app/components/DebugLinks';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login page',
};

export default function Login() {
  return (
    <main>
      <div>This is Login</div>
      <DebugLinks />
    </main>
  );
}
