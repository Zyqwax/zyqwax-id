import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';

export const metadata: Metadata = {
  title: { default: 'Zyqwax ID', template: '%s · Zyqwax ID' },
  description: 'Zyqwax hesabını güvenle yönet.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
