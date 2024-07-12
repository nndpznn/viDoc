'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/legacy/image'

import { Avatar, CircularProgress, IconButton, Button, Container, Grid, Card, Typography, Stack } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import { supabase } from '@/clients/supabaseClient'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'

import VideoCard from '../uicomponents/videoCard'

const theme = createTheme({
  palette: {
    primary: {
      main: '#102BEF',
    },
    secondary: {
      main: '#575962',
    },
  },
  typography: {
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
})

export default function Dashboard() {
  const router = useRouter()

  const { avatarUrl, fullName, loading: metadataLoading } = useSupabaseUserMetadata()

  console.log({
    avatarUrl,
    fullName,
    metadataLoading,
  })

  const handleClick = async () => {
    router.push('/')
    await supabase.auth.signOut()
  }

  return (
    <Container>
      <ThemeProvider theme={theme}>
        <Button variant="contained" onClick={handleClick} sx={{ ml: 1, mt: 2 }}>
          Log Out
        </Button>

        <Stack alignItems="center" justifyContent="center" direction="row" gap={1} sx={{ mt: 2 }}>
          <IconButton size="small" aria-label="menu" sx={{}}>
            {metadataLoading ? <CircularProgress /> : <Avatar alt={fullName} src={avatarUrl} />}
          </IconButton>

          <Typography variant="h6">{fullName}</Typography>
        </Stack>

        <Typography variant="h4" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        <br></br>

        <Stack alignItems="center" direction="row" gap={14}>
          <Grid>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Your Projects
            </Typography>
          </Grid>

          <Grid item xs={'auto'}>
            <Button variant="contained" size="medium" color="primary">
              Create New
            </Button>
          </Grid>
        </Stack>

        <br></br>

        <Grid container spacing={4} sx={{}}>
          <Grid item xs>
            <VideoCard />
          </Grid>
        </Grid>
      </ThemeProvider>
    </Container>
  )
}
