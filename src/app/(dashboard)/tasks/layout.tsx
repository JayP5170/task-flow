import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'Manage individual assignments, priority levels, and deadlines for your organization.',
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
