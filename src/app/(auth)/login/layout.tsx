import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Access your high-performance workspace. Secure login to manage your squad and projects.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
