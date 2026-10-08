'use client'

import { useState } from 'react'
import { X, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const REASONS = ['Spam', 'Harassment', 'Misleading Information', 'Other']

export default function ReportModal({ reportableType, reportableId, onClose }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to report content')
      return
    }

    setSubmitting(true)
    await supabase.from('reports').insert({
      reporter_id: user.id,
      reportable_type: reportableType,
      reportable_id: reportableId,
      reason
    })
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(onClose, 1500)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 'var(--spacing-4)'
    }} onClick={onClose}>
      <div className="card" style={{
        maxWidth: '28rem',
        width: '100%',
        padding: 'var(--spacing-6)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <Flag size={18} /> Report Content
          </h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>
            <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Report submitted</p>
            <p className="text-muted text-sm" style={{ marginTop: 'var(--spacing-2)' }}>
              Thank you for helping keep the community safe.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-4)' }}>
              Why are you reporting this {reportableType}?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
              {REASONS.map(r => (
                <label key={r} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${reason === r ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
                  backgroundColor: reason === r ? 'var(--color-primary-50)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.15s'
                }}>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    style={{ accentColor: 'var(--color-primary-600)' }}
                  />
                  {r}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!reason || submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
