import { Tables } from './supabase.database.types'

export const PROFILES_TABLE = 'profiles'

// Basic table rows with optional fields (for updates and inserts)
export type ProfileRow = Partial<Tables<'profiles'>>
