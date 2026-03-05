import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Join the premium squad. Create your TaskFlow account and start managing projects with peak efficiency.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
