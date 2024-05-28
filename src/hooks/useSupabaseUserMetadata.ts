import { useEffect, useState } from 'react'
import { useSupabaseUser } from './useSupabaseUser'

export const useSupabaseUserMetadata = () => {
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState<string | undefined>('')
  const [fullName, setFullName] = useState('')
  const [uid, setUid] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const { user, loading: userLoading } = useSupabaseUser()

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setFullName(user.user_metadata.full_name)
      setUid(user.id)
      setAvatarUrl(user.user_metadata.avatar_url)
      setLoading(false)
    }
  }, [user])

  return { email, fullName, uid, avatarUrl, loading }
}
