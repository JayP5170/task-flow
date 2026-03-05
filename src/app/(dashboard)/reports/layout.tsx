import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics',
  description: 'A data-driven view of your organization performance, project analytics, and metrics reports.',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
