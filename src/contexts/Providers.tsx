'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { CssBaseline, ThemeProvider } from '@mui/material'
import SnackbarProvider from '@/providers/SnackbarProvider'
import theme from '@/app/theme/allTheme'

export function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID')

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}
