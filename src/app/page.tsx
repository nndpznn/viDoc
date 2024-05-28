'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/legacy/image'

import { supabase } from '@/clients/supabaseClient'

import { useTheme, Theme } from '@mui/material/styles'
import { Avatar, CircularProgress, IconButton } from '@mui/material'
import Box from '@mui/material/Box'

import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

import * as SupabaseAuthController from '@/controllers/SupabaseAuthController'

// Use local images only (allows autosizing) -- not the public directory
// https://nextjs.org/docs/app/building-your-application/optimizing/images#local-images
// import logoImage from '@/assets/logo_image.png'

import { splitFullName } from '@/utils/strings'
import { ProfileRow, PROFILES_TABLE } from '@/types/supabase.database.custom.types'
import useViewportHeight from '@/hooks/useViewportHeight'
import { useSupabaseUserMetadata } from '@/hooks/useSupabaseUserMetadata'

const useStyles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: theme.palette.background.default,
    backgroundColor: 'gray',
    fontWeight: 'bold',
    gap: theme.spacing(8),
  },

  logoContainer: {
    width: '60%',
    height: 'auto',
    // marginBottom: theme.spacing(8),
    [theme.breakpoints.up('sm')]: {
      width: '35%',
    },
    [theme.breakpoints.up('md')]: {
      width: '30%',
    },
    [theme.breakpoints.up('lg')]: {
      width: '25%',
    },
    [theme.breakpoints.up('xl')]: {
      width: '15%',
    },
  },

  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(5),
    color: 'black',
  },

  subtitle: {
    // fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
})

export default function Home() {
  const classes = useStyles(useTheme())

  const router = useRouter()
  const viewportHeight = useViewportHeight()

  const [loading, setLoading] = useState(false)

  const { avatarUrl, fullName, loading: metadataLoading } = useSupabaseUserMetadata()

  console.log({
    avatarUrl,
    fullName,
    metadataLoading,
  })

  useEffect(() => {
    const checkSession = async () => {
      console.info('CHECKING SESSION')
      const sessionData = await supabase.auth.getSession()
      const user = sessionData?.data.session
      console.info('DASHBOARD USER: ', user)

      if (user) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleClick = () => {
    console.info('Avatar Clicked')
  }

  return (
    <Box
      sx={{
        ...classes.root,
        height: `${viewportHeight}px`,
      }}
    >
      <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleClick}>
        {metadataLoading ? <CircularProgress /> : <Avatar alt={fullName} src={avatarUrl} />}
      </IconButton>
      <Box sx={classes.logoContainer}>
        <Image
          src="/images/your_app_logo_image.png"
          alt="Your App Logo Alt Text"
          layout="responsive"
          width="783"
          height="899"
        />
      </Box>

      {/* Add the logo here */}

      {loading ? (
        <CircularProgress />
      ) : (
        <GoogleLogin
          useOneTap={false}
          type="standard"
          onSuccess={async (credentialResponse: CredentialResponse) => {
            setLoading(true)
            console.info('CREDENTIAL RESPONSE JWT TOKEN: ', JSON.stringify(credentialResponse, null, 2))

            if (!credentialResponse.credential) throw new Error('No credential found in response')

            // Sign in to Supabase with the Google credential
            // https://supabase.com/docs/guides/auth/social-login/auth-google#using-personalized-sign-in-buttons-one-tap-or-automatic-signin
            const supabaseResponse = await SupabaseAuthController.signInWithIdToken({
              provider: 'google',
              token: credentialResponse.credential,
            })

            console.info('SUPABASE signInWithIdToken RESPONSE: ', supabaseResponse)

            // Get the user's full name from the response
            const { fullName, email, uid } = SupabaseAuthController.extractSupabaseUserFields(supabaseResponse)

            // Split the full name into first and last name
            const { firstName, lastName } = splitFullName(fullName)

            // Search Supabase profiles table for the profile by UID
            const { data: profileData, error: profileError } = await supabase
              .from(PROFILES_TABLE)
              .select()
              .eq('uid', uid)
              .single()
            console.info('EXISTING PROFILE DATA: ', profileData)

            const baseUpsertData: ProfileRow = {
              uid,
              full_name: fullName,
              email,
            }

            // If the first and last name are already in the profiles table, leave them out of the upsert
            const upsertData =
              profileData?.first_name && profileData?.last_name
                ? baseUpsertData
                : {
                    ...baseUpsertData,
                    first_name: firstName,
                    last_name: lastName,
                  }

            // Upsert the row
            const { data, error } = await supabase
              .from(PROFILES_TABLE)
              .upsert([upsertData], { onConflict: 'uid' }) // On insert conflict, update by uid
              .select()
            console.info('UPSERTED DATA: ', data)

            if (error) console.error('UPSERT ERROR: ', error)

            console.info('routing to dashboard...')

            router.push('/dashboard')
          }}
          onError={() => {
            console.info('Login Failed')
          }}
        />
      )}
    </Box>
  )
}
