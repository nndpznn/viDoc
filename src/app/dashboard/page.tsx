'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar, CircularProgress, IconButton, Button, Container, Grid, Card, Typography, Stack } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { supabase } from '@/clients/supabaseClient'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'

import VideoCard from '../uicomponents/videoCard'
import Project from '../models/project'
import LogoutButton from '../uicomponents/logoutButton'

import theme from '../theme/allTheme'

// EXAMPLE PROJECTS
const project1 = new Project('Korea Vlog #1', 'The first of many Study Abroad vlogs!', 1234567)
const project2 = new Project('Korea Pre-Prep', 'Finishing up some last things I need to do before leaving.', 2345678)
const project3 = new Project('Doing absolutely... something?', 'Maybe I do have it in me.', 3456789)

export default function Dashboard() {
  const router = useRouter()

  const { avatarUrl, fullName, loading: metadataLoading } = useSupabaseUserMetadata()

  console.log({
    avatarUrl,
    fullName,
    metadataLoading,
  })

  const handleLogout = async () => {
    router.push('/')
    await supabase.auth.signOut()
  }

  const [fetchError, setFetchError] = useState<any>(null)
  const [projects, setProjects] = useState<any>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select().order('created_at', { ascending: false })

      if (error) {
        setFetchError('Error fetching viDoc projects for this user.')
        setProjects(null)
        console.log(error)
      }
      if (data) {
        setProjects(data)
        setFetchError(null)
      }
    }

    fetchProjects()
  }, [])

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <LogoutButton logoutFunction={handleLogout} />

          <Button
            disabled={true}
            variant="contained"
            size="medium"
            color="primary"
            onClick={() => router.push('/dragdropTest')}
          >
            Drag/Drop
          </Button>
        </Stack>

        <Stack alignItems="center" justifyContent="center" direction="row" gap={1} sx={{ mt: 2 }}>
          <IconButton size="small" aria-label="menu" sx={{}}>
            {metadataLoading ? <CircularProgress /> : <Avatar alt={fullName} src={avatarUrl} />}
          </IconButton>

          <Typography variant="h6">
            <span style={{ backgroundColor: '#575962', padding: 10, borderRadius: 15 }}>{fullName}</span>
          </Typography>
        </Stack>

        <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        <br></br>

        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Your Projects
          </Typography>

          <Button variant="contained" size="medium" color="primary" onClick={() => router.push('/createPage')}>
            Create New
          </Button>
        </Stack>

        <br></br>

        <Grid container spacing={0} columns={{ xs: 4, sm: 8, md: 12 }} alignItems="center">
          {fetchError && (
            <Typography
              variant="h4"
              sx={{
                ml: 8,
                mr: 8,
                mt: 15,
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: '#575962',
                padding: 5,
                borderRadius: 15,
              }}
            >
              {fetchError}
            </Typography>
          )}

          {projects && (
            <>
              {projects.map((project: Project) => (
                <Grid
                  key={project.id}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  onClick={() => router.push(`/dashboard/${project.id}`)}
                >
                  <VideoCard project={project}></VideoCard>
                </Grid>
              ))}
            </>
          )}

          {/* <Grid item xs={12} sm={4}>
            <VideoCard project={project1} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VideoCard project={project2} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <VideoCard project={project3} />
          </Grid> */}
        </Grid>
      </ThemeProvider>
    </Container>
  )
}
