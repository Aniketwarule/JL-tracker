'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, MapPin, GraduationCap, Building2, ChevronDown, ChevronUp, Filter, TrendingUp } from 'lucide-react'
import { timeAgo, LOCATIONS, formatDate, anonymizeUser, formatXplorePoints, formatIPAScore } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import styles from './page.module.css'

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [filterCity, setFilterCity] = useState('')
  const [filterStream, setFilterStream] = useState('')
  const [filterScore, setFilterScore] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterXplore, setFilterXplore] = useState('')
  
  const [monthOptions, setMonthOptions] = useState([])
  
  // Expanded Cards
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const options = []
    const d = new Date()
    for (let i = 0; i < 6; i++) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      options.push({ value: `${year}-${month}`, label: d.toLocaleDateString('default', { month: 'long', year: 'numeric' }) })
      d.setMonth(d.getMonth() - 1)
    }
    setMonthOptions(options)
  }, [])

  useEffect(() => {
    fetchData()
  }, [filterCity, filterStream, filterScore, filterMonth, filterXplore])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      // 1. Fetch Entries with filters
      let query = supabase
        .from('jl_entries')
        .select('*, profiles(username, full_name, avatar_url)')
        .eq('is_deleted', false)
        .order('jl_date', { ascending: false })
        
      if (filterCity) query = query.eq('work_location', filterCity)
      if (filterStream) query = query.eq('stream', filterStream)
      
      if (filterScore) {
        if (filterScore === '<40') query = query.lt('ipa_score', 40)
        else if (filterScore === '40-60') query = query.gte('ipa_score', 40).lt('ipa_score', 60)
        else if (filterScore === '60-80') query = query.gte('ipa_score', 60).lt('ipa_score', 80)
        else if (filterScore === '80-100') query = query.gte('ipa_score', 80).lte('ipa_score', 100)
      }

      if (filterMonth) {
        // filterMonth is like "2026-10"
        const startDate = `${filterMonth}-01`
        // basic next month calculation for end date
        const [year, month] = filterMonth.split('-')
        const nextMonth = month === '12' ? '01' : String(parseInt(month) + 1).padStart(2, '0')
        const nextYear = month === '12' ? parseInt(year) + 1 : year
        const endDate = `${nextYear}-${nextMonth}-01`
        
        query = query.gte('jl_date', startDate).lt('jl_date', endDate)
      }

      if (filterXplore) {
        if (filterXplore === '<500') query = query.lt('xplore_points', 500)
        else if (filterXplore === '500-1000') query = query.gte('xplore_points', 500).lt('xplore_points', 1000)
        else if (filterXplore === '1000-1500') query = query.gte('xplore_points', 1000).lt('xplore_points', 1500)
        else if (filterXplore === '1500-2000') query = query.gte('xplore_points', 1500).lt('xplore_points', 2000)
        else if (filterXplore === '>2000') query = query.gte('xplore_points', 2000)
      }
      
      const { data } = await query.limit(100)
      setEntries(data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null)
    else setExpandedId(id)
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-2)' }}>Community JL Tracker</h1>
        <p className="text-muted">See the latest Joining Letters received across all TCS locations.</p>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar Filters */}
        <div className={styles.sidebar}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', margin: 0 }}>
                <Filter size={18} /> Filters
              </h3>
              {(filterCity || filterStream || filterScore || filterMonth || filterXplore) && (
                <button 
                  className="btn btn-ghost" 
                  style={{ padding: '0 var(--spacing-2)', fontSize: '0.875rem', minHeight: 'auto' }}
                  onClick={() => {setFilterCity(''); setFilterStream(''); setFilterScore(''); setFilterMonth(''); setFilterXplore('');}}
                >
                  Reset
                </button>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label text-xs">Work Location</label>
              <select className="form-select text-sm" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                <option value="">All Locations</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label text-xs">Stream</label>
              <select className="form-select text-sm" value={filterStream} onChange={e => setFilterStream(e.target.value)}>
                <option value="">All Streams</option>
                <option value="Digital">Digital</option>
                <option value="Ninja">Ninja</option>
                <option value="Prime">Prime</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label text-xs">IPA Score</label>
              <select className="form-select text-sm" value={filterScore} onChange={e => setFilterScore(e.target.value)}>
                <option value="">All Scores</option>
                <option value="80-100">80 - 100%</option>
                <option value="60-80">60 - 80%</option>
                <option value="40-60">40 - 60%</option>
                <option value="<40">Below 40%</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">JL Month</label>
              <select className="form-select text-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="">All Months</option>
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label text-xs">Xplore Points</label>
              <select className="form-select text-sm" value={filterXplore} onChange={e => setFilterXplore(e.target.value)}>
                <option value="">All Points</option>
                <option value=">2000">2000+</option>
                <option value="1500-2000">1500 - 2000</option>
                <option value="1000-1500">1000 - 1500</option>
                <option value="500-1000">500 - 1000</option>
                <option value="<500">Below 500</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className={styles.feed}>
          {loading ? (
            <div className="card"><LoadingSkeleton height="80px" count={5} /></div>
          ) : entries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p className="text-muted">No joining letters found matching your filters.</p>
              <button className="btn btn-ghost mt-4" onClick={() => {setFilterCity(''); setFilterStream(''); setFilterScore(''); setFilterMonth(''); setFilterXplore('');}}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {entries.map(entry => {
                const isExpanded = expandedId === entry.id
                
                return (
                  <div key={entry.id} className={`card ${styles.entryCard} ${isExpanded ? styles.expanded : ''}`} onClick={() => toggleExpand(entry.id)}>
                    {/* Preview (Always Visible) */}
                    <div className={styles.entryPreview}>
                      <div className={styles.entryAvatar}>
                        <span>{entry.profiles?.full_name ? entry.profiles.full_name.charAt(0).toUpperCase() : 'U'}</span>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                          <div>
                            <span className="font-semibold">{anonymizeUser(entry.user_id, entry.profiles?.full_name || entry.profiles?.username)}</span>
                            <span className="text-muted text-sm ml-2"> got JL on {formatDate(entry.jl_date)}</span>
                          </div>
                          <span className="text-xs text-muted">{timeAgo(entry.created_at)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                          <Badge status={entry.stream} />
                          <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <MapPin size={12} /> {entry.work_location || 'Unknown'}
                          </span>
                          {entry.ipa_score && (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <GraduationCap size={12} /> {formatIPAScore(entry.ipa_score)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.expandIcon}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className={styles.entryDetails}>
                        <div className={styles.timelineGrid}>
                          <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <span className="text-xs text-muted">Interview</span>
                            <span className="font-semibold text-sm">{formatDate(entry.interview_date)}</span>
                          </div>
                          <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <span className="text-xs text-muted">Offer Letter</span>
                            <span className="font-semibold text-sm">{formatDate(entry.ol_date)}</span>
                          </div>
                          <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <span className="text-xs text-muted">Joining Letter</span>
                            <span className="font-semibold text-sm">{formatDate(entry.jl_date)}</span>
                          </div>
                          <div className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>
                            <span className="text-xs text-muted">Onboarding</span>
                            <span className="font-semibold text-sm">{formatDate(entry.onboarding_date)}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-6)' }}>
                          <div>
                            <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Technical Details</h4>
                            <p className="text-sm"><strong>Batch:</strong> {entry.batch_year || 'N/A'}</p>
                            <p className="text-sm"><strong>Domain:</strong> {entry.interview_domain || 'N/A'}</p>
                            <p className="text-sm"><strong>Campus:</strong> {entry.campus_type || 'N/A'}</p>
                            <p className="text-sm"><strong>Xplore Points:</strong> {formatXplorePoints(entry.xplore_points)}</p>
                            <p className="text-sm"><strong>IPA Status:</strong> {entry.ipa_status} {entry.ipa_score ? `(${formatIPAScore(entry.ipa_score)})` : ''}</p>
                          </div>
                          <div>
                            <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Locations</h4>
                            <p className="text-sm"><strong>ILP Location:</strong> {entry.ilp_location || 'N/A'}</p>
                            <p className="text-sm"><strong>Work Location:</strong> {entry.work_location || 'N/A'}</p>
                            <div className="text-sm mt-1">
                              <strong>Preferences:</strong> 
                              <span className="text-muted"> {entry.pref_loc_1}, {entry.pref_loc_2}, {entry.pref_loc_3}</span>
                            </div>
                          </div>
                        </div>
                        
                        {entry.additional_notes && (
                          <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-md)' }}>
                            <p className="text-sm"><strong>Notes:</strong> {entry.additional_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
