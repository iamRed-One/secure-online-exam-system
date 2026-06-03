import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Toaster } from 'sonner';
import LoadingBar from './components/LoadingBar';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SecureExam Portal",
  description: "Secure Online Examination System — powered by formal methods",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },           // fallback for older browsers
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: 'Outfit, sans-serif', backgroundColor: '#f9fafb', color: '#101828' }}
      >
        {/* Force light mode before React hydrates */}
        <Script id="theme-init" strategy="beforeInteractive" src="/theme-init.js" />

        <ThemeProvider>
          <SidebarProvider>
            <LoadingBar />
            <Toaster
              position="top-right"
              richColors
              toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }}
            />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
