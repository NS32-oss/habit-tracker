import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PWARegister } from '@/components/pwa-register'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Purrfect Habits',
  description: 'Track your daily habits with your cute cat companion',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <PWARegister />
          <Toaster position="top-center" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
