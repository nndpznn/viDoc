'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Avatar, CircularProgress, IconButton, Button, Box, Container } from '@mui/material'

import { supabase } from '@/clients/supabaseClient'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'

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
      {/* <Button href="/">Click here to go back.</Button> */}
    </div>
  )
}
