import Link from 'next/link'
import supabase from './config/supabaseClient'

export default function Page() {
  //   console.log(supabase)

  return (
    <div>
      <h1>You are Home.</h1>
      <Link href="/dashboard">Click here to navigate to Dashboard!</Link>
    </div>
  )
}
