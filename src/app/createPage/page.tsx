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

import theme from '../theme/allTheme'
import { useState } from 'react'
import { supabase } from '@/clients/supabaseClient'

export default function CreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  const { avatarUrl, fullName, loading: metadataLoading } = useSupabaseUserMetadata()

  const handleCancel = () => {
    router.push('/dashboard')
  }

  const handleClear = () => {
    setTitle('')
    setDescription('')
  }

  const handleSubmit = async (e: any) => {
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
      return
    }

    const userID = session.user.id

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title: title,
          description: description,
          user_id: userID,
          full_name: fullName,
        },
      ])
      .select()

    if (error) {
      console.log(error)
      setFormError('Please fill in all fields before submitting.')
    }

    if (data) {
      console.log(data)
      console.log('form data submitted successfully!', title, description)
      setFormError('')
      router.push('/dashboard')
    }
  }

  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Button variant="contained" size="medium" color="primary" sx={{ mt: 2 }} onClick={handleCancel}>
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
            fullWidth={true}
            sx={{ mt: 1, backgroundColor: '#575962' }}
            InputProps={{
              style: {
                fontSize: '1.75rem',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          ></TextField>

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
            fullWidth={true}
            sx={{ mt: 1, backgroundColor: '#575962' }}
            InputProps={{
              style: {
                fontSize: '1.75rem',
                color: '#ffffff',
                fontWeight: 600,
              },
            }}
          ></TextField>

          {/* {formError && (
            <Typography variant="h5" sx={{ ml: 8, mr: 8, mt: 15, textAlign: 'center', fontWeight: 'bold' }}>
              {formError}
            </Typography>
          )} */}
        </form>

        <Stack direction="row" justifyContent="space-between">
          <Button variant="contained" size="medium" color="primary" onClick={handleClear} sx={{ mt: 2 }}>
            Clear
          </Button>
          <Button variant="contained" size="medium" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
            Post
          </Button>
        </Stack>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle id="alert-dialog-title">{'Submitting error.'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please fill out all fields before submitting.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleClose}>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </Container>
  )
}
