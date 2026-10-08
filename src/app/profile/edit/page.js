'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { LOCATIONS } from '@/lib/utils'

export default function EditProfilePage() {
  const { user, loading: authLoading, profile } = useUser()
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    stream: '',
    preferred_location: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        full_name: profile.full_name || '',
        stream: profile.stream || '',
        preferred_location: profile.preferred_location || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        stream: form.stream || null,
        preferred_location: form.preferred_location || null
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
    } else {
      router.push('/profile')
      router.refresh()
    }
  }

  if (authLoading) return <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>Loading...</div>
  if (!user) return <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>Please sign in.</div>

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '32rem' }}>
      <button className="btn btn-ghost" style={{ marginBottom: 'var(--spacing-4)' }} onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleSubmit} className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-6)' }}>Edit Profile</h1>

        {error && (
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="form-input"
            type="text"
            value={form.username}
            onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            value={form.full_name}
            onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stream</label>
          <select
            className="form-select"
            value={form.stream}
            onChange={e => setForm(prev => ({ ...prev, stream: e.target.value }))}
          >
            <option value="">Not selected</option>
            <option value="Digital">Digital</option>
            <option value="Ninja">Ninja</option>
            <option value="Prime">Prime</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Location</label>
          <select
            className="form-select"
            value={form.preferred_location}
            onChange={e => setForm(prev => ({ ...prev, preferred_location: e.target.value }))}
          >
            <option value="">Not selected</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 'var(--spacing-6)' }}>
          <button type="submit" className="btn btn-primary w-full" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
