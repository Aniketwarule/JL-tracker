'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogIn } from 'lucide-react'
import styles from './page.module.css'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin@tcs2026') {
      localStorage.setItem('tcs_admin_session', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={`card ${styles.loginCard}`}>
        <div className={styles.iconWrap}>
          <Shield size={32} />
        </div>
        <h1 style={{ fontSize: '1.25rem', textAlign: 'center', marginBottom: 'var(--spacing-1)' }}>Admin Panel</h1>
        <p className="text-muted text-sm" style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          Enter admin credentials to access moderation tools.
        </p>

        {error && (
          <div style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-4)',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required />
        </div>

        <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--spacing-2)' }}>
          <LogIn size={18} /> Sign In
        </button>
      </form>
    </div>
  )
}
