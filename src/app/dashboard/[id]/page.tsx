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
} from '@mui/material'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProjectDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [data, setData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDelete, setOpenDelete] = useState(false)

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

        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle id="alert-dialog-title">{'Delete viDoc?'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This project won&apos;t ever see the light of day... are you sure?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleDelete} autoFocus>
              Yes, delete
            </Button>
          </DialogActions>
        </Dialog>

        <Typography variant="h3" sx={{ mt: 2, mb: 2 }}>
          Timeline
        </Typography>
        <TimelineCard timeline={exampleTimeline1}></TimelineCard>

        <Stack alignItems="center" justifyContent="space-between" direction="row">
          <Typography variant="h3" sx={{ mt: 2, mb: 2 }}>
            Inklings
          </Typography>
          <Button variant="contained" size="medium">
            New
          </Button>
        </Stack>

        <InklingCard inkling={exampleInkling1}></InklingCard>
      </ThemeProvider>
    </Container>
  )
}
