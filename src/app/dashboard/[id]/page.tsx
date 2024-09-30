'use client'

import Inkling from '@/app/models/inkling'
import Project from '@/app/models/project'
import Timeline from '@/app/models/timeline'
import theme from '@/app/theme/allTheme'
import InklingCard from '@/app/uicomponents/inklingCard'
import TimelineCard from '@/app/uicomponents/timelineCard'
import { supabase } from '@/clients/supabaseClient'
import {
  Button,
  Container,
  Stack,
  ThemeProvider,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from '@mui/material'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = useParams()

  const [openDelete, setOpenDelete] = useState(false)
  const [openNewInkling, setOpenNewInkling] = useState(false)
  const [newInklingTitle, setNewInklingTitle] = useState('')
  const [newInklingBody, setNewInklingBody] = useState('')
  const [formError, setFormError] = useState('')

  const [data, setData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  // Handling delete post
  const handleDelete = async () => {
    const { data, error } = await supabase.from('projects').delete().eq('id', id)
    router.back()

    if (error) {
      console.log(error)
    }
    if (data) {
      console.log(data)
    }
  }

  const handleCloseInklings = () => {
    setOpenNewInkling(false)
    setNewInklingTitle('')
    setNewInklingBody('')
  }

  // IN PROGRESS SUBMIT FUNCTION
  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!newInklingTitle || !newInklingBody) {
      setFormError('Please fill out all fields before submitting.')
      // setOpen(true)
      return
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      setFormError('User is not authenticated.')
      console.log('session error')
      return
    }

    const userID = session.user.id
    console.log(userID)

    const { data, error } = await supabase
      .from('inklings')
      .insert([
        {
          title: newInklingTitle,
          body: newInklingBody,
          project_id: id,
          user_id: userID,
        },
      ])
      .select()

    if (error) {
      console.log('data error')
      setFormError("Data couldn't be published.")
    }

    if (data) {
      console.log(data)
      console.log('form data submitted successfully!', newInklingBody, newInklingTitle)
      setNewInklingTitle('')
      setNewInklingBody('')
      setFormError('')
      setOpenNewInkling(false)
    }
  }

  // Fetching project information from Supabase based on page ID.
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

      if (error) {
        console.error('There was an error fetching the project.', error)
      } else {
        setData(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  // Loading case, displays basic graphic
  if (loading || !data)
    return (
      <div>
        <ThemeProvider theme={theme}>
          <Button variant="contained" sx={{ ml: 2, mt: 2, mb: 2 }} onClick={() => router.back()}>
            Back
          </Button>
          <Typography
            variant="h2"
            sx={{
              fontStyle: 'italic',
              textAlign: 'center',
              mt: 15,
              ml: 6,
              mr: 6,
              backgroundColor: '#575962',
              padding: 5,
              borderRadius: 15,
            }}
          >
            {loading ? 'Loading your viDoc...' : 'Data not found.'}
          </Typography>
        </ThemeProvider>
      </div>
    )

  // EXAMPLE TIMELINE
  const exampleTimeline1 = new Timeline()
  // EXAMPLE INKLING
  const exampleInkling1 = new Inkling(
    'General order of scenes',
    '1 - Intro monologue about locking in and working on internship applications. 2 - Baseball game w/ HUG. 3 - Cafe of the Week, probably Protokoll.'
  )

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Stack alignItems="center" justifyContent="space-between" direction="row">
          <Button variant="contained" sx={{ mt: 2, mb: 2 }} onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="contained" size="medium" color="primary" sx={{ mt: 2 }} onClick={() => setOpenDelete(true)}>
            Delete
          </Button>
          <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
            <DialogTitle id="alert-dialog-title">Delete viDoc?</DialogTitle>
            <DialogContent>This project won&apos;t ever see the light of day... are you sure?</DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => setOpenDelete(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleDelete} autoFocus>
                Yes, delete
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>

        <Typography variant="h1" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
          &quot;{data.title}&quot;
        </Typography>

        <Typography variant="h5" sx={{ fontStyle: 'italic', textAlign: 'center', ml: 3, mr: 3 }}>
          {data.description}
        </Typography>

        <Stack alignItems="center" justifyContent="center" direction="row" gap={25}>
          <Button variant="contained" size="medium" color="primary" sx={{ mt: 2 }}>
            Edit project info
          </Button>
        </Stack>

        <Typography variant="h3" sx={{ mt: 2, mb: 2 }}>
          Timeline
        </Typography>
        <TimelineCard timeline={exampleTimeline1}></TimelineCard>

        <Stack alignItems="center" justifyContent="space-between" direction="row">
          <Typography variant="h3" sx={{ mt: 2, mb: 2 }}>
            Inklings
          </Typography>
          <Button variant="contained" size="medium" onClick={() => setOpenNewInkling(true)}>
            New
          </Button>
          <Dialog open={openNewInkling} onClose={handleCloseInklings}>
            <DialogTitle id="new-inkling-heading">New Inkling</DialogTitle>
            <DialogContent>
              Title
              <TextField
                value={newInklingTitle}
                onChange={e => setNewInklingTitle(e.target.value)}
                autoFocus
                required
                margin="dense"
                fullWidth
                variant="outlined"
                InputProps={{
                  style: {
                    fontSize: '1.75rem',
                    color: '#ffffff',
                    fontWeight: 600,
                  },
                }}
              />
              Body
              <TextField
                onChange={e => setNewInklingBody(e.target.value)}
                value={newInklingBody}
                multiline
                rows={4}
                autoFocus
                required
                margin="dense"
                fullWidth
                variant="outlined"
                InputProps={{
                  style: {
                    fontSize: '1.75rem',
                    color: '#ffffff',
                    fontWeight: 600,
                  },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleCloseInklings}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" onClick={handleSubmit}>
                Post
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>

        <InklingCard inkling={exampleInkling1}></InklingCard>
      </ThemeProvider>
    </Container>
  )
}
