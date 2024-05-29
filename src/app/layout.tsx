import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CssBaseline } from '@mui/material'
import { Providers } from '@/contexts/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ViDoc: Video Planning and Brainstorming',
  description: 'WORK-IN-PROGRESS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CssBaseline />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
