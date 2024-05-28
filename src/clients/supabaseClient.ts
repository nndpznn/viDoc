import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL) throw new Error('NEXT_PUBLIC_SUPABASE_PROJECT_URL is not set')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_API_KEY) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_API_KEY is not set')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_API_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
