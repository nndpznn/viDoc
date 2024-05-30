'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/legacy/image'

import { Avatar, CircularProgress, IconButton, Button, Box, Container, Grid, Card } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

import { supabase } from '@/clients/supabaseClient'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'

const theme = createTheme({
  palette: {
    primary: grey,
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
    <div>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mt: 1, ml: 1, mr: 1 }}
        onClick={handleClick}
      >
        {metadataLoading ? <CircularProgress /> : <Avatar alt={fullName} src={avatarUrl} />}
      </IconButton>
      <p className="font-semibold ml-2">Log Out</p>

      <h1 className="text-center text-2xl font-bold">Your Dashboard</h1>
      <p className="text-center">{fullName}</p>
      {/* <Button href="/">Click here to go back.</Button> */}

      <br></br>

      <ThemeProvider theme={theme}>
        <Grid container spacing={2} className="flex justify-center content-center">
          <Grid item xs={'auto'}>
            <Button variant="contained" size="large" color="primary">
              Create Project
            </Button>
          </Grid>
          <Grid item xs={'auto'}>
            <Button variant="contained" size="large" color="primary">
              View Projects
            </Button>
          </Grid>
        </Grid>
      </ThemeProvider>

      <br></br>

      <Grid container spacing={4} className="flex justify-center content-center">
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
        <Grid item xs={6}>
          <Image src="/images/Not-Found.png" alt="ViDoc Logo" layout="responsive" width="300" height="170" />
        </Grid>
      </Grid>
    </div>
  )
}
