import { DebugLinks } from '@/app/components/DebugLinks';
import type { Metadata } from 'next';
import { LoginWithGoogleButton } from './LoginWithGoogleButton';

export const metadata: Metadata = {
  title: 'Login page',
};

export default function Login() {
  return (
    <main>
      <div>This is Login</div>
      <LoginWithGoogleButton />
      <DebugLinks />
    </main>
  );
}
