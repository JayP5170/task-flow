import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'A comprehensive high-level overview of your project metrics and active squad member assignments.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
