import { supabase } from '@/clients/supabaseClient'
import { AuthTokenResponse, SignInWithIdTokenCredentials, User } from '@supabase/supabase-js'

// Fetch the user object from the database
// https://supabase.com/docs/reference/javascript/auth-getuser?example=get-the-logged-in-user-with-the-current-existing-session
export const getUser = async () => {
  const user = supabase.auth.getUser()
  return user
}

// Fetch the session from local storage (can be tampered with!)
// https://supabase.com/docs/reference/javascript/auth-getsession?example=get-the-session-data
export const getSession = async () => {
  const session = supabase.auth.getSession()
  return session
}

export const signInWithIdToken = async (credentials: SignInWithIdTokenCredentials): Promise<AuthTokenResponse> => {
  const supabaseResponse = await supabase.auth.signInWithIdToken(credentials)
  return supabaseResponse
}

export const extractSupabaseUserFields = (response: AuthTokenResponse) => {
  if (!response.data.user) throw new Error('User not found in response')
  const user: User = response.data.user
  const fullName = user.user_metadata.full_name
  const email = user.email
  const uid = user.id
  return { fullName, email, uid }
}
