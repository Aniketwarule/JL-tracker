'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VoteButton({ votableType, votableId, initialVotes = 0, userVote = null }) {
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to vote')
      return
    }

    setLoading(true)
    const newValue = currentVote === value ? 0 : value

    // Optimistic update
    const diff = newValue - (currentVote || 0)
    setVotes(prev => prev + diff)
    setCurrentVote(newValue === 0 ? null : newValue)

    try {
      if (newValue === 0) {
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('votable_type', votableType)
          .eq('votable_id', votableId)
      } else {
        await supabase
          .from('votes')
          .upsert({
            user_id: user.id,
            votable_type: votableType,
            votable_id: votableId,
            value: newValue
          }, { onConflict: 'user_id,votable_type,votable_id' })
      }
    } catch (err) {
      // Revert on error
      setVotes(initialVotes)
      setCurrentVote(userVote)
    }
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px'
    }}>
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
          color: currentVote === 1 ? 'var(--color-primary-600)' : 'var(--color-text-tertiary)',
          transition: 'color 0.15s'
        }}
        aria-label="Upvote"
      >
        <ChevronUp size={20} strokeWidth={currentVote === 1 ? 3 : 2} />
      </button>
      <span style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: votes > 0 ? 'var(--color-primary-600)' : votes < 0 ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
        minWidth: '1.5rem',
        textAlign: 'center'
      }}>
        {votes}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: 'var(--radius-sm)',
          color: currentVote === -1 ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
          transition: 'color 0.15s'
        }}
        aria-label="Downvote"
      >
        <ChevronDown size={20} strokeWidth={currentVote === -1 ? 3 : 2} />
      </button>
    </div>
  )
}
