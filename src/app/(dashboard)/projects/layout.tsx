import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A centralized view of all active and archived projects. Track status, priority, and deadlines across your organization.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
