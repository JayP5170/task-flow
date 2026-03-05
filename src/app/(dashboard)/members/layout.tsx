import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Squad Members',
  description: 'Manage your high-performance team, roles, and administrative clearance levels.',
};

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
