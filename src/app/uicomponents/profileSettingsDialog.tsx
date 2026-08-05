'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import { supabase } from '@/clients/supabaseClient'
import { useSnackbar } from '@/providers/SnackbarProvider'

type Props = {
  open: boolean
  onClose: () => void
  uid: string
  initialFullName: string
  initialEmail?: string
}

export default function ProfileSettingsDialog({ open, onClose, uid, initialFullName, initialEmail }: Props) {
  const { showToast } = useSnackbar()
  const [fullName, setFullName] = useState(initialFullName)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    if (!open || !uid) return

    let cancelled = false

    void (async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name, first_name, last_name, email')
        .eq('uid', uid)
        .maybeSingle()

      if (cancelled) return
      if (fetchError) {
        console.error(fetchError)
        setFullName(initialFullName)
        setFirstName('')
        setLastName('')
        setError('')
        setSessionKey(k => k + 1)
        return
      }

      setFullName(data?.full_name ?? initialFullName)
      setFirstName(data?.first_name ?? '')
      setLastName(data?.last_name ?? '')
      setError('')
      setSessionKey(k => k + 1)
    })()

    return () => {
      cancelled = true
    }
  }, [open, uid, initialFullName])

  const handleSave = async () => {
    if (!uid) {
      setError('You must be signed in to update your profile.')
      return
    }
    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('uid', uid)

    setSaving(false)

    if (updateError) {
      setError(updateError.message || 'Could not save profile.')
      return
    }

    showToast('Profile successfully saved.')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Profile settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} key={sessionKey}>
          {initialEmail && (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Signed in as {initialEmail}
            </Typography>
          )}
          <TextField label="Full name" fullWidth value={fullName} onChange={e => setFullName(e.target.value)} />
          <TextField label="First name" fullWidth value={firstName} onChange={e => setFirstName(e.target.value)} />
          <TextField label="Last name" fullWidth value={lastName} onChange={e => setLastName(e.target.value)} />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
