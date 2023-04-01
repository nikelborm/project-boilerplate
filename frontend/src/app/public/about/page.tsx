import { DebugLinks } from '@/app/components/DebugLinks';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About page',
};

export default function About() {
  return (
    <main>
      <div>This is About</div>
      <DebugLinks />
    </main>
  );
}
