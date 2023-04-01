import { cookies } from 'next/headers';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('AuthLayout');
  const cookieStore = cookies();
  return (
    <>
      {cookieStore.getAll().map((cookie) => (
        <div key={cookie.name}>
          <p>Name: {cookie.name}</p>
          <p>Value: {cookie.value}</p>
        </div>
      ))}
      {children}
    </>
  );
}
