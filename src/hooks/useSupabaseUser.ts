import { useEffect, useState } from 'react'

import { supabase } from '@/clients/supabaseClient'

import { User, UserResponse } from '@supabase/supabase-js'

export const useSupabaseUser = () => {
  const [user, setUser] = useState<User | null>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const response: UserResponse = await supabase.auth.getUser()
      const user = response.data.user

      setUser(user)
      setLoading(false)

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.info('useSupabaseUser hook > onAuthStateChange > event: ', event)
        // const response: UserResponse = await supabase.auth.getUser() // tried to use secure getUser but hangs?
        // const user = response.data.user

        setUser(session?.user ?? null) // original copilot code (but session is not secure?)
        setUser(user)
        setLoading(false)
      })

      return () => {
        authListener?.subscription.unsubscribe()
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
