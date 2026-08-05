'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Snackbar, type SnackbarOrigin } from '@mui/material'

type ToastOptions = Partial<SnackbarOrigin> & {
  autoHideDuration?: number
}

type SnackbarContextValue = {
  showToast: (message: string, options?: ToastOptions) => void
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) {
    throw new Error('useSnackbar must be used within SnackbarProvider')
  }
  return ctx
}

export default function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [vertical, setVertical] = useState<SnackbarOrigin['vertical']>('bottom')
  const [horizontal, setHorizontal] = useState<SnackbarOrigin['horizontal']>('right')
  const [autoHideDuration, setAutoHideDuration] = useState(4000)

  const showToast = useCallback((nextMessage: string, options?: ToastOptions) => {
    setMessage(nextMessage)
    setVertical(options?.vertical ?? 'bottom')
    setHorizontal(options?.horizontal ?? 'right')
    setAutoHideDuration(options?.autoHideDuration ?? 4000)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={() => setOpen(false)}
        message={message}
      />
    </SnackbarContext.Provider>
  )
}
