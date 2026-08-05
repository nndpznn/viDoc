'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Avatar,
  CircularProgress,
  IconButton,
  Button,
  Container,
  Grid,
  Typography,
  Stack,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { supabase } from '@/clients/supabaseClient'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'
import { loadProjectMeta } from '@/utils/projectLocalStore'

import VideoCard from '../uicomponents/videoCard'
import Project from '../models/project'
import LogoutButton from '../uicomponents/logoutButton'
import ProfileSettingsDialog from '../uicomponents/profileSettingsDialog'

import theme from '../theme/allTheme'

export default function Dashboard() {
  const router = useRouter()

  const { avatarUrl, fullName, email, uid, loading: metadataLoading } = useSupabaseUserMetadata()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    router.push('/')
    await supabase.auth.signOut()
  }

  const [fetchError, setFetchError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select().order('created_at', { ascending: false })

      if (error) {
        setFetchError('Error fetching viDoc projects for this user.')
        setProjects(null)
        console.log(error)
      } else if (data) {
        setProjects(
          data.map((row: { id: number; title: string; description: string; deadline?: string | null }) => {
            const meta = loadProjectMeta(String(row.id))
            return new Project(row.title, row.description, row.id, row.deadline ?? meta.deadline ?? null)
          })
        )
        setFetchError(null)
      }
      setLoadingProjects(false)
    }

    void fetchProjects()
  }, [])

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <LogoutButton logoutFunction={handleLogout} />
        </Stack>

        <Stack alignItems="center" justifyContent="center" direction="row" gap={1} sx={{ mt: 2 }}>
          <IconButton size="small" aria-label="Open profile settings" onClick={() => setProfileOpen(true)}>
            {metadataLoading ? <CircularProgress size={32} /> : <Avatar alt={fullName} src={avatarUrl} />}
          </IconButton>

          <Typography variant="h6">
            <span style={{ backgroundColor: '#575962', padding: 10, borderRadius: 15 }}>{fullName}</span>
          </Typography>
        </Stack>

        <Stack alignItems="center" sx={{ mt: 1 }}>
          <Button variant="contained" size="small" color="secondary" onClick={() => setProfileOpen(true)}>
            Profile settings
          </Button>
        </Stack>

        <ProfileSettingsDialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          uid={uid}
          initialFullName={fullName}
          initialEmail={email}
        />

        <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        <br />

        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Your Projects
          </Typography>

          <Button variant="contained" size="medium" color="primary" onClick={() => router.push('/createPage')}>
            Create New
          </Button>
        </Stack>

        <br />

        <Grid container alignItems="center">
          {loadingProjects && (
            <Stack sx={{ width: '100%', mt: 8 }} alignItems="center">
              <CircularProgress />
            </Stack>
          )}

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

          {!loadingProjects && projects && projects.length === 0 && (
            <Typography
              variant="h5"
              sx={{
                width: '100%',
                mt: 8,
                textAlign: 'center',
                backgroundColor: '#575962',
                padding: 4,
                borderRadius: 4,
              }}
            >
              No projects yet — create your first viDoc.
            </Typography>
          )}

          {projects &&
            projects.map((project: Project) => (
              <Grid key={project.id} item onClick={() => router.push(`/dashboard/${project.id}`)}>
                <VideoCard project={project} />
              </Grid>
            ))}
        </Grid>
      </ThemeProvider>
    </Container>
  )
}
