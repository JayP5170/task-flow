import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize your personal workspace identity, preferences, and security details.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
