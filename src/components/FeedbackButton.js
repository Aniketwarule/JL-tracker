'use client'

import { useState } from 'react'
import { MessageSquarePlus, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('feature')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const { user } = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setStatus('submitting')
    const supabase = createClient()
    
    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      type,
      message
    })

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
        setMessage('')
      }, 2000)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          borderRadius: 'var(--radius-full)',
          width: '56px',
          height: '56px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          zIndex: 50
        }}
        aria-label="Feedback"
      >
        <MessageSquarePlus size={24} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '320px',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          border: '1px solid var(--color-border)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }} className="animate-fade-in">
          
          <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-main)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Send Feedback</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: 'var(--spacing-4)' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0', color: 'var(--color-success)' }}>
                <p>Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={type === 'feature'} onChange={() => setType('feature')} /> Feature
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" checked={type === 'bug'} onChange={() => setType('bug')} /> Bug Report
                  </label>
                </div>

                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{ marginBottom: 'var(--spacing-4)', resize: 'none' }}
                  required
                />

                {status === 'error' && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>Failed to send. Try again.</p>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={status === 'submitting' || !message.trim()}
                >
                  {status === 'submitting' ? 'Sending...' : (
                    <>Send <Send size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
