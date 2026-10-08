'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReportModal from '@/components/forums/ReportModal'

export default function PostActions({ postId, showCommentForm = false }) {
  const [showReport, setShowReport] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleComment = async () => {
    if (!commentText.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to comment')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('forum_comments').insert({
      post_id: postId,
      author_id: user.id,
      body: commentText.trim(),
      is_anonymous: false
    })

    if (!error) {
      setCommentText('')
      setSubmitted(true)
      router.refresh()
      setTimeout(() => setSubmitted(false), 2000)
    }
    setSubmitting(false)
  }

  return (
    <>
      {!showCommentForm && (
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-ghost" style={{ fontSize: '0.8125rem' }} onClick={() => setShowReport(true)}>
            <Flag size={14} /> Report
          </button>
        </div>
      )}

      {showCommentForm && (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <textarea
            className="form-textarea"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            style={{ resize: 'vertical', marginBottom: 'var(--spacing-2)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handleComment} disabled={submitting || !commentText.trim()}>
              <MessageSquare size={16} /> {submitting ? 'Posting...' : 'Post Comment'}
            </button>
            {submitted && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)' }}>✓ Comment posted!</span>
            )}
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal reportableType="post" reportableId={postId} onClose={() => setShowReport(false)} />
      )}
    </>
  )
}
