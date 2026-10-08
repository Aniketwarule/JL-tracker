'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Menu, X, ChevronDown, LogOut, User, BarChart3, MessageSquare, FileText } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsDropdownOpen(false)
    router.push('/')
  }

  return (
    <nav style={{
      backgroundColor: 'var(--color-bg-card)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--color-text-primary)',
          fontWeight: '700',
          fontSize: '1.25rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: 'white',
            borderRadius: '10px',
            width: '2.25rem',
            height: '2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.7rem',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)'
          }}>
            TCS
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            JL <span style={{ 
              fontWeight: 400, 
              color: 'var(--color-text-secondary)',
              fontSize: '1.15rem'
            }}>Tracker</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-6)'
        }}>
          <Link href="/dashboard" className="btn-ghost btn" style={{ color: 'var(--color-text-secondary)' }}>
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link href="/forums" className="btn-ghost btn" style={{ color: 'var(--color-text-secondary)' }}>
            <MessageSquare size={18} /> Forums
          </Link>
          
          <Link href="/submit" className="btn-outline btn">
            <FileText size={18} /> Submit JL
          </Link>
          
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ padding: '0.25rem', borderRadius: 'var(--radius-full)' }}
              >
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600'
                }}>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown size={16} />
              </button>
              
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 'var(--spacing-2)',
                  width: '12rem',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 'var(--spacing-2) 0',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--spacing-2)' }}>
                    <p className="text-sm font-semibold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                  </div>
                  <Link href="/profile" className="btn btn-ghost" style={{ justifyContent: 'flex-start', borderRadius: 0 }} onClick={() => setIsDropdownOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', borderRadius: 0, color: 'var(--color-danger)' }} onClick={handleSignOut}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleSignIn}>
              Sign in with Google
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="btn btn-ghost"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div style={{
          padding: 'var(--spacing-4)',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-2)'
        }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
            <BarChart3 size={18} /> Dashboard
          </Link>
          <Link href="/forums" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
            <MessageSquare size={18} /> Forums
          </Link>
          
          <Link href="/submit" className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
            <FileText size={18} /> Submit JL
          </Link>
          
          {user ? (
            <>
              <Link href="/profile" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
                <User size={18} /> Profile
              </Link>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-danger)' }} onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                <LogOut size={18} /> Sign out
              </button>
            </>
          ) : (
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => { handleSignIn(); setIsMenuOpen(false); }}>
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
