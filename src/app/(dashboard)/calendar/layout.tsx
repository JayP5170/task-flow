import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Manage your time, deadlines, and project milestones with our high-performance calendar view.',
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
