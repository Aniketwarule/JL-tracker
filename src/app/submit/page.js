'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Info } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { LOCATIONS } from '@/lib/utils'
import styles from './page.module.css'

export default function SubmitPage() {
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditing = searchParams.get('edit') === 'true'
  const [editId, setEditId] = useState(null)
  
  const [step, setStep] = useState(0) // 0 is initial check, 1-4 is form
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If editing, user must be logged in
    if (isEditing && !authLoading && !user) {
      setChecking(false)
      return
    }
    
    // If not logged in and not editing, allow guest submission
    if (!user && !authLoading) {
      setChecking(false)
      return
    }

    if (!user) return

    const checkExisting = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('jl_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .single()

      if (data) {
        if (isEditing) {
          setEditId(data.id)
          setForm({
            interview_date: data.interview_date || '',
            ol_date: data.ol_date || '',
            jl_date: data.jl_date || '',
            onboarding_date: data.onboarding_date || '',
            batch_year: data.batch_year || '',
            interview_domain: data.interview_domain || '',
            stream: data.stream || '',
            xplore_points: data.xplore_points || 0,
            ipa_status: data.ipa_status || 'Not Given',
            ipa_score: data.ipa_score || '',
            campus_type: data.campus_type || '',
            pref_loc_1: data.pref_loc_1 || '',
            pref_loc_2: data.pref_loc_2 || '',
            pref_loc_3: data.pref_loc_3 || '',
            ilp_location: data.ilp_location || '',
            work_location: data.work_location || '',
            additional_notes: data.additional_notes || ''
          })
          setStep(1)
        } else {
          setHasSubmitted(true)
        }
      }
      setChecking(false)
    }

    checkExisting()
  }, [user, isEditing, authLoading])

  // Form State
  const [form, setForm] = useState({
    // Dates
    interview_date: '',
    ol_date: '',
    jl_date: '',
    onboarding_date: '',
    // Details
    batch_year: '',
    interview_domain: '',
    stream: '',
    xplore_points: 0,
    ipa_status: 'Not Given',
    ipa_score: '',
    campus_type: '',
    // Locations
    pref_loc_1: '',
    pref_loc_2: '',
    pref_loc_3: '',
    ilp_location: '',
    work_location: '',
    // Extras
    additional_notes: '',
    // Honeypot (invisible to real users)
    website_url: ''
  })

  if (authLoading || checking) return <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>Loading...</div>

  // Only block if editing and not logged in
  if (isEditing && !user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <h2>Sign in required</h2>
        <p className="text-muted">You must be signed in to edit your JL timeline.</p>
        <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>Go Home</button>
      </div>
    )
  }

  if (hasSubmitted) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Already Submitted</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-6)' }}>
          You have already submitted your JL timeline. You can view it on your profile.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
          <button onClick={() => router.push('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
          <button onClick={() => router.push('/profile')} className="btn btn-secondary">View Profile</button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
        <CheckCircle size={64} style={{ color: 'var(--color-success)', margin: '0 auto var(--spacing-4)' }} />
        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>{isEditing ? 'Timeline Updated!' : 'Timeline Submitted!'}</h2>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-6)' }}>
          Thank you for contributing to the community tracker.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
          <button onClick={() => router.push('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
          {user && <button onClick={() => router.push('/profile')} className="btn btn-secondary">View Profile</button>}
        </div>
      </div>
    )
  }

  const handleNext = () => setStep(s => s + 1)
  const handlePrev = () => setStep(s => s - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // If editing (user must be logged in), use Supabase client directly
    if (isEditing && editId && user) {
      const supabase = createClient()
      const payload = {
        user_id: user.id,
        interview_date: form.interview_date || null,
        ol_date: form.ol_date || null,
        jl_date: form.jl_date || null,
        onboarding_date: form.onboarding_date || null,
        batch_year: form.batch_year || null,
        interview_domain: form.interview_domain || null,
        stream: form.stream || null,
        xplore_points: parseInt(form.xplore_points) || 0,
        ipa_status: form.ipa_status,
        ipa_score: form.ipa_status === 'Given' && form.ipa_score ? parseFloat(form.ipa_score) : null,
        campus_type: form.campus_type || null,
        pref_loc_1: form.pref_loc_1 || null,
        pref_loc_2: form.pref_loc_2 || null,
        pref_loc_3: form.pref_loc_3 || null,
        ilp_location: form.ilp_location || null,
        work_location: form.work_location || null,
        additional_notes: form.additional_notes || null
      }

      const { error: updateErr } = await supabase.from('jl_entries').update(payload).eq('id', editId)
      if (updateErr) {
        setError(updateErr.message)
        setSubmitting(false)
      } else {
        setSuccess(true)
      }
      return
    }

    // New submission (guest or logged in) — use the API route
    try {
      const res = await fetch('/api/submit-jl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          interview_date: form.interview_date || null,
          ol_date: form.ol_date || null,
          jl_date: form.jl_date || null,
          onboarding_date: form.onboarding_date || null,
          batch_year: form.batch_year || null,
          interview_domain: form.interview_domain || null,
          stream: form.stream || null,
          xplore_points: form.xplore_points,
          ipa_status: form.ipa_status,
          ipa_score: form.ipa_score,
          campus_type: form.campus_type || null,
          pref_loc_1: form.pref_loc_1 || null,
          pref_loc_2: form.pref_loc_2 || null,
          pref_loc_3: form.pref_loc_3 || null,
          ilp_location: form.ilp_location || null,
          work_location: form.work_location || null,
          additional_notes: form.additional_notes || null,
          // Honeypot field (should be empty for real users)
          website_url: form.website_url
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.')
        setSubmitting(false)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '42rem' }}>
      {step === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-4)' }}>Have you received your Joining Letter?</h1>
          <p className="text-muted" style={{ marginBottom: 'var(--spacing-6)' }}>
            This submission form is only for candidates who have officially received their JL. 
            If you are still waiting, please check the dashboard to see the latest trends.
          </p>
          
          {/* Guest disclaimer */}
          {!user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 'var(--spacing-3)', 
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-primary-50, #f0f0ff)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-6)',
              textAlign: 'left'
            }}>
              <Info size={20} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: '2px' }} />
              <p className="text-sm" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                You are submitting as a guest. Your identity will remain anonymous. 
                <strong> This entry cannot be edited or deleted later.</strong>
              </p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center' }}>
            <button onClick={() => router.push('/dashboard')} className="btn btn-secondary">No, I'm still waiting</button>
            <button onClick={handleNext} className="btn btn-primary">Yes, I received my JL</button>
          </div>
        </div>
      )}

      {step > 0 && (
        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="card">
          <div style={{ marginBottom: 'var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>
              {step === 1 && 'Step 1: Timeline Dates'}
              {step === 2 && 'Step 2: Interview & Role Details'}
              {step === 3 && 'Step 3: Location Preferences'}
              {step === 4 && 'Step 4: Additional Notes'}
            </h2>
            <span className="text-muted text-sm">Step {step} of 4</span>
          </div>

          {error && (
            <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)' }}>
              {error}
            </div>
          )}

          {/* STEP 1: DATES */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div className="form-group">
                <label className="form-label">Interview Date</label>
                <input type="date" className="form-input" value={form.interview_date} onChange={e => setForm({...form, interview_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Offer Letter (OL) Date</label>
                <input type="date" className="form-input" value={form.ol_date} onChange={e => setForm({...form, ol_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Letter (JL) Date</label>
                <input type="date" className="form-input" value={form.jl_date} onChange={e => setForm({...form, jl_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Onboarding Date</label>
                <input type="date" className="form-input" value={form.onboarding_date} onChange={e => setForm({...form, onboarding_date: e.target.value})} required />
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <div className="form-group">
                <label className="form-label">Batch Year</label>
                <select className="form-select" value={form.batch_year} onChange={e => setForm({...form, batch_year: e.target.value})} required>
                  <option value="">Select batch</option>
                  <option value="2027">2027</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Campus Type</label>
                <select className="form-select" value={form.campus_type} onChange={e => setForm({...form, campus_type: e.target.value})} required>
                  <option value="">Select type</option>
                  <option value="On-campus">On-campus</option>
                  <option value="Off-campus">Off-campus</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Interview Domain</label>
                <select className="form-select" value={form.interview_domain} onChange={e => setForm({...form, interview_domain: e.target.value})} required>
                  <option value="">Select domain</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="Python">Python</option>
                  <option value="AIML">AIML</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Selected Stream (Role)</label>
                <select className="form-select" value={form.stream} onChange={e => setForm({...form, stream: e.target.value})} required>
                  <option value="">Select stream</option>
                  <option value="Digital">Digital</option>
                  <option value="Ninja">Ninja</option>
                  <option value="Prime">Prime</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Xplore Points</label>
                <input type="number" className="form-input" value={form.xplore_points} onChange={e => setForm({...form, xplore_points: e.target.value})} min="0" placeholder="e.g. 60" />
              </div>
              <div className="form-group">
                <label className="form-label">IPA Status</label>
                <select className="form-select" value={form.ipa_status} onChange={e => setForm({...form, ipa_status: e.target.value})}>
                  <option value="Not Given">Not Given</option>
                  <option value="Given">Given</option>
                </select>
              </div>
              {form.ipa_status === 'Given' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">IPA Score</label>
                  <input type="number" step="0.1" className="form-input" value={form.ipa_score} onChange={e => setForm({...form, ipa_score: e.target.value})} min="0" max="100" placeholder="e.g. 75.5" required />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: LOCATIONS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-2)' }}>
                Please share the 3 locations you preferred during the OL, and the locations you were actually assigned for ILP and Work.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-2)' }}>
                <div className="form-group">
                  <label className="form-label">Pref 1</label>
                  <select className="form-select" value={form.pref_loc_1} onChange={e => setForm({...form, pref_loc_1: e.target.value})} required>
                    <option value="">Select</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pref 2</label>
                  <select className="form-select" value={form.pref_loc_2} onChange={e => setForm({...form, pref_loc_2: e.target.value})}>
                    <option value="">Select</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Pref 3</label>
                  <select className="form-select" value={form.pref_loc_3} onChange={e => setForm({...form, pref_loc_3: e.target.value})}>
                    <option value="">Select</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ILP Location (Assigned)</label>
                <select className="form-select" value={form.ilp_location} onChange={e => setForm({...form, ilp_location: e.target.value})} required>
                  <option value="">Select ILP Location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Location (Assigned Base Branch)</label>
                <select className="form-select" value={form.work_location} onChange={e => setForm({...form, work_location: e.target.value})} required>
                  <option value="">Select Work Location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: EXTRAS */}
          {step === 4 && (
            <div className="form-group">
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea 
                className="form-textarea" 
                value={form.additional_notes} 
                onChange={e => setForm({...form, additional_notes: e.target.value})} 
                placeholder="Any other details to share about your timeline? (e.g. delays, specific emails received)"
                rows={5}
              />
            </div>
          )}

          {/* Honeypot field — hidden from real users, bots will fill it */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
            <label htmlFor="website_url">Leave this blank</label>
            <input 
              type="text" 
              id="website_url" 
              name="website_url" 
              value={form.website_url} 
              onChange={e => setForm({...form, website_url: e.target.value})} 
              tabIndex={-1} 
              autoComplete="off" 
            />
          </div>

          {/* Nav Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-8)' }}>
            <button type="button" className="btn btn-ghost" onClick={handlePrev} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>
              <ArrowLeft size={16} /> Back
            </button>
            
            {step < 4 ? (
              <button type="submit" className="btn btn-primary">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Timeline'} <CheckCircle size={16} />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
