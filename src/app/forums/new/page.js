'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { LOCATIONS } from '@/lib/utils'
import styles from './page.module.css'

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'JL Updates', slug: 'jl-updates' },
  { id: '2', name: 'IPA Discussion', slug: 'ipa-discussion' },
  { id: '3', name: 'Location Talk', slug: 'location-talk' },
  { id: '4', name: 'Interview Experience', slug: 'interview-experience' },
  { id: '5', name: 'Xplore & Learning', slug: 'xplore-learning' },
  { id: '6', name: 'General Q&A', slug: 'general-qa' },
]

export default function NewPostPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [form, setForm] = useState({
    title: '',
    body: '',
    category_id: '',
    location_tag: '',
    is_anonymous: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('forum_categories').select('id, name, slug').order('sort_order')
        if (data?.length) setCategories(data)
      } catch (e) {}
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim() || !form.category_id) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('forum_posts')
      .insert({
        author_id: user.id,
        category_id: form.category_id,
        title: form.title.trim(),
        body: form.body.trim(),
        location_tag: form.location_tag || null,
        is_anonymous: form.is_anonymous
      })
      .select('id, forum_categories(slug)')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    const slug = data.forum_categories?.slug || 'general-qa'
    router.push(`/forums/${slug}/${data.id}`)
  }

  if (authLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Sign in required</h2>
        <p className="text-muted">You need to sign in to create a post.</p>
      </div>
    )
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '42rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-6)' }}>Create New Post</h1>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-4)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            className="form-select"
            value={form.category_id}
            onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
            required
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            className="form-input"
            type="text"
            placeholder="What's on your mind?"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Body *</label>
          <textarea
            className="form-textarea"
            placeholder="Share your thoughts, experience, or question..."
            value={form.body}
            onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
            rows={8}
            required
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location Tag (optional)</label>
          <select
            className="form-select"
            value={form.location_tag}
            onChange={e => setForm(prev => ({ ...prev, location_tag: e.target.value }))}
          >
            <option value="">No location tag</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={e => setForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
              style={{ accentColor: 'var(--color-primary-600)' }}
            />
            <EyeOff size={16} />
            Post Anonymously
          </label>
          <p className="text-xs text-muted" style={{ marginTop: 'var(--spacing-1)', marginLeft: 'var(--spacing-6)' }}>
            Your identity will be hidden from other users
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Send size={16} /> {submitting ? 'Posting...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
