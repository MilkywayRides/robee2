import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';

import './globals.css';
import { auth } from '@/auth';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.AUTH_URL
      ? `${process.env.AUTH_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: 'R00Bee.',
  description:
    'This is a complete authentication example app built with Next.js 14 and Auth.js using the latest server actions.',
  openGraph: {
    url: '/',
    title: 'R00Bee.',
    description:
      'This is a complete authentication example app built with Next.js 14 and Auth.js using the latest server actions.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R00Bee.',
    description:
      'This is a complete authentication example app built with Next.js 14 and Auth.js using the latest server actions.'
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn('relative', inter.className)}
          suppressHydrationWarning // Add this to suppress warnings on the body
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
