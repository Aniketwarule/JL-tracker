'use client'

import Link from 'next/link'
import { MessageSquare, MapPin } from 'lucide-react'
import VoteButton from './VoteButton'
import { timeAgo } from '@/lib/utils'

export default function PostCard({ post, categorySlug }) {
  const author = post.is_anonymous ? 'Anonymous' : (post.profiles?.full_name || post.profiles?.username || 'Deleted User')
  const snippet = post.body?.length > 150 ? post.body.slice(0, 150) + '...' : post.body

  return (
    <div className="card" style={{ display: 'flex', gap: 'var(--spacing-3)', padding: 'var(--spacing-4)' }}>
      <VoteButton
        votableType="post"
        votableId={post.id}
        initialVotes={post.upvotes || 0}
        userVote={post.user_vote || null}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={`/forums/${categorySlug}/${post.id}`}
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            display: 'block',
            marginBottom: 'var(--spacing-1)'
          }}
        >
          {post.title}
        </Link>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-2)',
          lineHeight: 1.5
        }}>
          {snippet}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          fontSize: '0.75rem',
          color: 'var(--color-text-tertiary)',
          flexWrap: 'wrap'
        }}>
          <span>{author}</span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>

          {post.location_tag && (
            <>
              <span>·</span>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                <MapPin size={10} style={{ marginRight: '2px' }} />
                {post.location_tag}
              </span>
            </>
          )}

          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={12} />
            {post.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  )
}
