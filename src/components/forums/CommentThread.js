'use client'

import { useState } from 'react'
import { Reply, Flag } from 'lucide-react'
import VoteButton from './VoteButton'
import ReportModal from './ReportModal'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

function Comment({ comment, postId, depth = 0 }) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replies, setReplies] = useState(comment.replies || [])
  const [showReport, setShowReport] = useState(false)

  const author = comment.is_anonymous
    ? 'Anonymous'
    : (comment.profiles?.full_name || comment.profiles?.username || 'User')

  const handleReply = async () => {
    if (!replyText.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to reply')
      return
    }

    setSubmitting(true)
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        parent_comment_id: comment.id,
        body: replyText.trim(),
        is_anonymous: false
      })
      .select('*, profiles(username, full_name, avatar_url)')
      .single()

    if (!error && data) {
      setReplies(prev => [...prev, { ...data, replies: [] }])
      setReplyText('')
      setShowReply(false)

      // Update comment count on post
      await supabase.rpc('increment_comment_count', { post_id_input: postId }).catch(() => {})
    }
    setSubmitting(false)
  }

  return (
    <div style={{
      marginLeft: depth > 0 ? 'var(--spacing-6)' : 0,
      borderLeft: depth > 0 ? '2px solid var(--color-primary-100)' : 'none',
      paddingLeft: depth > 0 ? 'var(--spacing-4)' : 0,
      marginTop: 'var(--spacing-3)'
    }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
        <VoteButton
          votableType="comment"
          votableId={comment.id}
          initialVotes={comment.upvotes || 0}
          userVote={comment.user_vote || null}
        />

        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-2)',
            fontSize: '0.75rem',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--spacing-1)'
          }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{author}</span>
            <span>·</span>
            <span>{timeAgo(comment.created_at)}</span>
          </div>

          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
            {comment.body}
          </p>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '2px 6px' }}
              onClick={() => setShowReply(!showReply)}
            >
              <Reply size={14} /> Reply
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '2px 6px' }}
              onClick={() => setShowReport(true)}
            >
              <Flag size={14} />
            </button>
          </div>

          {showReply && (
            <div style={{ marginTop: 'var(--spacing-2)', display: 'flex', gap: 'var(--spacing-2)' }}>
              <textarea
                className="form-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{ flex: 1, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                <button className="btn btn-primary" style={{ fontSize: '0.75rem' }} onClick={handleReply} disabled={submitting}>
                  {submitting ? '...' : 'Post'}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => setShowReply(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {replies.map(reply => (
        <Comment key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}

      {showReport && (
        <ReportModal
          reportableType="comment"
          reportableId={comment.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}

export default function CommentThread({ comments = [], postId }) {
  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-muted" style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        comments.map(comment => (
          <Comment key={comment.id} comment={comment} postId={postId} depth={0} />
        ))
      )}
    </div>
  )
}
