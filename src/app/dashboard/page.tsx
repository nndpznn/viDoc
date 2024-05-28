'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Avatar, CircularProgress, IconButton } from '@mui/material'

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
      <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleClick}>
        {metadataLoading ? <CircularProgress /> : <Avatar alt={fullName} src={avatarUrl} />}
      </IconButton>
      <h1>Hey there, ViDoc Dashboard!</h1>
      <Link href="/">Click here to go back.</Link>
    </div>
  )
}
