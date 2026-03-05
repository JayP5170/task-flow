import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracking',
  description: 'View real-time progress of all ongoing projects and task completion rates across your organization.',
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
