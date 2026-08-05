import { useSupabaseUser } from './useSupabaseUser'

export const useSupabaseUserMetadata = () => {
  const { user, loading } = useSupabaseUser()

  return {
    email: user?.email,
    fullName: user?.user_metadata?.full_name ?? '',
    uid: user?.id ?? '',
    avatarUrl: user?.user_metadata?.avatar_url ?? '',
    loading,
  }
}
