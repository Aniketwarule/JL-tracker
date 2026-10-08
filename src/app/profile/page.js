'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Edit, FileText, MessageSquare, AlertTriangle } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import { timeAgo, formatDate, getXploreRange, getIPARange } from '@/lib/utils'
import styles from './page.module.css'

export default function ProfilePage() {
  const { user, loading: authLoading, profile } = useUser()
  const [activeTab, setActiveTab] = useState('entries')
  const [entry, setEntry] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const supabase = createClient()
      const [entriesRes, postsRes] = await Promise.all([
        supabase.from('jl_entries').select('*').eq('user_id', user.id).eq('is_deleted', false).single(),
        supabase.from('forum_posts').select('*, forum_categories(name, slug)').eq('author_id', user.id).eq('is_deleted', false).order('created_at', { ascending: false })
      ])
      if (entriesRes.data) setEntry(entriesRes.data)
      setPosts(postsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleDeleteTimeline = async () => {
    if (!confirm('Are you sure you want to delete your JL timeline? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('jl_entries').update({ is_deleted: true }).eq('id', entry.id)
    setEntry(null)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: Are you sure you want to permanently delete your account? This will mark all your posts as deleted and remove your profile.')) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (res.ok) {
        // Sign out user locally
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/'
      } else {
        alert('Failed to delete account.')
        setLoading(false)
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>Loading...</div>
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <User size={48} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5, margin: '0 auto var(--spacing-4)' }} />
        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Sign in to view your profile</h2>
        <p className="text-muted">You need to be signed in to access your profile.</p>
      </div>
    )
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '48rem' }}>
      {/* Profile Header */}
      <div className={`card ${styles.profileHeader}`}>
        <div className={styles.avatar}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
          ) : (
            <span>{user.email?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.25rem' }}>{profile?.full_name || user.email}</h1>
          <p className="text-muted text-sm">@{profile?.username || 'user'}</p>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap' }}>
            {profile?.stream && <Badge status={profile.stream} />}
            {profile?.preferred_location && (
              <span className="badge badge-neutral">{profile.preferred_location}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <Link href="/profile/edit" className="btn btn-secondary">
            <Edit size={16} /> Edit
          </Link>
          <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', fontSize: '0.875rem', padding: '0.5rem' }} onClick={handleDeleteAccount}>
            <AlertTriangle size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'entries' ? styles.tabActive : ''}`} onClick={() => setActiveTab('entries')}>
          <FileText size={16} /> My JL Timeline
        </button>
        <button className={`${styles.tab} ${activeTab === 'posts' ? styles.tabActive : ''}`} onClick={() => setActiveTab('posts')}>
          <MessageSquare size={16} /> My Posts ({posts.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {activeTab === 'entries' && (
            !entry ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                <p className="text-muted">You haven't submitted your JL timeline yet.</p>
                <Link href="/submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-3)' }}>
                  Submit Your JL Details
                </Link>
              </div>
            ) : (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                  <h3 style={{ fontSize: '1.125rem', margin: 0 }}>My Journey</h3>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <Link href="/submit?edit=true" className="btn btn-ghost" style={{ padding: '0 var(--spacing-2)' }}>Edit</Link>
                    <button className="btn btn-ghost" style={{ padding: '0 var(--spacing-2)', color: 'var(--color-danger)' }} onClick={handleDeleteTimeline}>
                      Delete
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                  <Badge status={entry.stream} />
                  {entry.campus_type && <span className="badge badge-neutral">{entry.campus_type}</span>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                  <div>
                    <p className="text-sm text-muted">Interview Date</p>
                    <p className="font-semibold">{formatDate(entry.interview_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Offer Letter</p>
                    <p className="font-semibold">{formatDate(entry.ol_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Joining Letter</p>
                    <p className="font-semibold">{formatDate(entry.jl_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Onboarding</p>
                    <p className="font-semibold">{formatDate(entry.onboarding_date)}</p>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                  <div>
                    <p className="text-sm"><strong>Domain:</strong> {entry.interview_domain || 'N/A'}</p>
                    <p className="text-sm"><strong>IPA:</strong> {entry.ipa_status} {entry.ipa_score != null ? `(${getIPARange(entry.ipa_score)})` : ''}</p>
                    <p className="text-sm"><strong>Xplore:</strong> {getXploreRange(entry.xplore_points)}</p>
                  </div>
                  <div>
                    <p className="text-sm"><strong>ILP:</strong> {entry.ilp_location || 'N/A'}</p>
                    <p className="text-sm"><strong>Work:</strong> {entry.work_location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                <p className="text-muted">You haven't created any posts yet.</p>
                <Link href="/forums/new" className="btn btn-primary" style={{ marginTop: 'var(--spacing-3)' }}>
                  Create a Post
                </Link>
              </div>
            ) : posts.map(post => (
              <Link href={`/forums/${post.forum_categories?.slug || 'general'}/${post.id}`} className="card" key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>{post.title}</h3>
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-2)' }}>
                  {post.body?.slice(0, 100)}{post.body?.length > 100 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: 'var(--spacing-3)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  <span>{post.forum_categories?.name}</span>
                  <span>↑ {post.upvotes}</span>
                  <span>{post.comment_count || 0} comments</span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
