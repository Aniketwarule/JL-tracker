'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = 2026

  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-main)',
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--spacing-8) 0 var(--spacing-6)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-6)',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-2)'
          }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--color-text-primary)',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: 'white',
                borderRadius: '8px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)'
              }}>TCS</span>
              JL <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>Tracker</span>
            </h3>
            <p className="text-sm text-muted" style={{ maxWidth: '400px' }}>
              An unofficial community platform. We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Tata Consultancy Services (TCS).
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-6)'
          }}>
            <Link href="/dashboard" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Dashboard</Link>
            <Link href="/forums" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Forums</Link>
            <Link href="/about" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>About</Link>
          </div>

          <div style={{
            borderTop: '1px solid var(--color-border)',
            width: '100%',
            paddingTop: 'var(--spacing-6)',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <p className="text-xs text-muted">
              &copy; {currentYear} TCS JL Tracker. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
