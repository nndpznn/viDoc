'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { supabase } from '@/clients/supabaseClient'

import { ThemeProvider } from '@mui/material/styles'
import { CircularProgress, Typography, Box } from '@mui/material'

import { CredentialResponse, GoogleLogin } from '@react-oauth/google'

import * as SupabaseAuthController from '@/controllers/SupabaseAuthController'

import { splitFullName } from '@/utils/strings'
import { ProfileRow, PROFILES_TABLE } from '@/types/supabase.database.custom.types'
import theme from './theme/allTheme'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await supabase.auth.getSession()
      const user = sessionData?.data.session
      if (user) {
        router.push('/dashboard')
      }
    }
    void checkSession()
  }, [router])

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#787b87',
          fontWeight: 'bold',
          gap: 8,
          minHeight: '100dvh',
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          welcome to <span style={{ backgroundColor: '#102BEF', padding: 10, borderRadius: 15 }}>viDoc</span>
        </Typography>

        <Box
          sx={{
            width: { xs: '60%', sm: '35%', md: '30%', lg: '25%', xl: '15%' },
            height: 'auto',
          }}
        >
          <Image
            src="/images/cameraplaceholderlogo.png"
            alt="ViDoc Logo"
            width={512}
            height={512}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>

        {loading ? (
          <CircularProgress />
        ) : (
          <GoogleLogin
            useOneTap={false}
            size="large"
            type="standard"
            onSuccess={async (credentialResponse: CredentialResponse) => {
              setLoading(true)

              if (!credentialResponse.credential) throw new Error('No credential found in response')

              const supabaseResponse = await SupabaseAuthController.signInWithIdToken({
                provider: 'google',
                token: credentialResponse.credential,
              })

              const { fullName, email, uid } = SupabaseAuthController.extractSupabaseUserFields(supabaseResponse)
              const { firstName, lastName } = splitFullName(fullName)

              const { data: profileData } = await supabase.from(PROFILES_TABLE).select().eq('uid', uid).single()

              const baseUpsertData: ProfileRow = {
                uid,
                full_name: fullName,
                email,
              }

              const upsertData =
                profileData?.first_name && profileData?.last_name
                  ? baseUpsertData
                  : {
                      ...baseUpsertData,
                      first_name: firstName,
                      last_name: lastName,
                    }

              const { error } = await supabase
                .from(PROFILES_TABLE)
                .upsert([upsertData], { onConflict: 'uid' })
                .select()

              if (error) console.error('UPSERT ERROR: ', error)

              router.push('/dashboard')
            }}
            onError={() => {
              console.info('Login Failed')
            }}
          />
        )}
      </Box>
    </ThemeProvider>
  )
}
