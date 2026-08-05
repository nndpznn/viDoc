'use client'

import {
  Button,
  Container,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material'

import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'
import { useRouter } from 'next/navigation'
import { saveProjectMeta } from '@/utils/projectLocalStore'

import theme from '../theme/allTheme'
import { useState } from 'react'
import { supabase } from '@/clients/supabaseClient'

export default function CreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [formError, setFormError] = useState('')
  const [open, setOpen] = useState(false)

  const { fullName } = useSupabaseUserMetadata()

  const handleClear = () => {
    setTitle('')
    setDescription('')
    setDeadline('')
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()

    if (!title || !description) {
      setFormError('Please fill out all fields before submitting.')
      setOpen(true)
      return
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      setFormError('User is not authenticated.')
      setOpen(true)
      return
    }

    const userID = session.user.id

    const payload: {
      title: string
      description: string
      user_id: string
      deadline?: string
    } = {
      title,
      description,
      user_id: userID,
    }

    if (deadline) payload.deadline = deadline

    let { data, error } = await supabase.from('projects').insert([payload]).select()

    // If deadline column is missing, retry without it and store locally.
    if (error && deadline) {
      const retry = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            user_id: userID,
          },
        ])
        .select()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.log(error)
      setFormError("Data couldn't be published.")
      setOpen(true)
      return
    }

    if (data?.[0]?.id != null) {
      if (deadline) saveProjectMeta(String(data[0].id), { deadline })
      setFormError('')
      router.push(`/dashboard/${data[0].id}`)
      return
    }

    router.push('/dashboard')
  }

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>

        <Typography variant="h2" sx={{ mt: 5 }}>
          Create a new viDoc.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="h3" sx={{ ml: 3, mt: 3 }}>
            / title
          </Typography>
          <TextField
            value={title}
            onChange={e => setTitle(e.target.value)}
            size="medium"
            variant="outlined"
            fullWidth
            sx={{ mt: 1, backgroundColor: '#575962' }}
            InputProps={{
              style: {
                fontSize: '1.75rem',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          />

          <Typography variant="h3" sx={{ ml: 3, mt: 3 }}>
            / description
          </Typography>
          <TextField
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={4}
            size="medium"
            variant="outlined"
            fullWidth
            sx={{ mt: 1, backgroundColor: '#575962' }}
            InputProps={{
              style: {
                fontSize: '1.75rem',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          />

          <Typography variant="h3" sx={{ ml: 3, mt: 3 }}>
            / deadline
          </Typography>
          <TextField
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            size="medium"
            variant="outlined"
            fullWidth
            sx={{ mt: 1, backgroundColor: '#575962' }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              style: {
                fontSize: '1.75rem',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          />
        </form>

        <Stack direction="row" justifyContent="space-between">
          <Button variant="contained" size="medium" color="primary" onClick={handleClear} sx={{ mt: 2 }}>
            Clear
          </Button>
          <Button variant="contained" size="medium" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
            Post
          </Button>
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Submitting error.</DialogTitle>
          <DialogContent>
            <DialogContentText>{formError || 'Please fill out all fields before submitting.'}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setOpen(false)}>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </Container>
  )
}
