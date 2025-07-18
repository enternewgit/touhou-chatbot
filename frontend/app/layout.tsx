// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '東方LINEチャット',
  description: '東方キャラとLINEできるトボット',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ここを lang="en" に変更
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}