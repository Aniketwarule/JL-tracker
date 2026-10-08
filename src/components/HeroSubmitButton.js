'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function HeroSubmitButton({ user }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (user) {
    return (
      <Link href="/submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-primary-600)' }}>
        Submit JL Details <ArrowRight size={18} />
      </Link>
    )
  }

  return (
    <button 
      className="btn btn-primary" 
      style={{ backgroundColor: 'var(--color-primary-600)' }}
      onClick={async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback?next=/submit` }
        })
      }}
    >
      Submit JL Details <ArrowRight size={18} />
    </button>
  )
}
