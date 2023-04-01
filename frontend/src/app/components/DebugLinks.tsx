import Link from 'next/link';

export function DebugLinks() {
  console.log('DebugLinks');
  return (
    <div>
      <ul>
        <li>
          <Link href="/closed/auth/login">to login</Link>
        </li>
        <li>
          <Link href="/closed/auth/register">to register</Link>
        </li>
        <li>
          <Link href="/closed/authed/admin">to admin</Link>
        </li>
        <li>
          <Link href="/closed/authed/client">to client</Link>
        </li>
        <li>
          <Link href="/closed/authed/org">to org</Link>
        </li>
        <li>
          <Link href="/public/about">to about</Link>
        </li>
        <li>
          <Link href="/">to public root</Link>
        </li>
      </ul>
    </div>
  );
}
