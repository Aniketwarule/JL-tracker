'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, LogOut, Flag, FileText, Database, AlertTriangle } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import styles from './page.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [posts, setPosts] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('tcs_admin_session') !== 'true') {
        router.push('/admin')
        return
      }
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/admin', {
        method: 'GET',
        headers: { 'X-Admin-Token': 'admin@tcs2026' }
      })

      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
        setPosts(data.posts || [])
        setEntries(data.entries || [])
      } else {
        console.error('Admin fetch failed with status:', res.status)
      }
    } catch (e) {
      console.error('Admin fetch error:', e)
    }
    setLoading(false)
  }

  const adminAction = async (action, type, id) => {
    if (!confirm('Are you sure?')) return
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'admin@tcs2026' },
        body: JSON.stringify({ action, type, id })
      })
      if (res.ok) {
        fetchData()
      } else {
        alert('Action failed')
      }
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tcs_admin_session')
    router.push('/admin')
  }

  const tabs = [
    { key: 'reports', label: 'Reports', icon: Flag, count: reports.filter(r => r.status === 'pending').length },
    { key: 'posts', label: 'All Posts', icon: FileText, count: posts.length },
    { key: 'entries', label: 'JL Entries', icon: Database, count: entries.length }
  ]

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <h1 style={{ fontSize: '1.5rem' }}>Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count > 0 && <span className="badge badge-primary">{tab.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>Loading...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Reported Content</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-tertiary)' }}>No reports</td></tr>
                  ) : reports.map(r => (
                    <tr key={r.id}>
                      <td>{r.profiles?.username || 'Unknown'}</td>
                      <td><span className="badge badge-neutral">{r.reportable_type}</span></td>
                      <td>{r.reason}</td>
                      <td>
                        <div style={{ maxWidth: '20rem', fontSize: '0.8125rem' }}>
                          {r.reportable_type === 'post' ? (
                            <>
                              <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content_title || 'Post deleted or missing'}</strong>
                              <span className="text-muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content_body}</span>
                            </>
                          ) : (
                            <span className="text-muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.content_body || 'Comment deleted or missing'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-sm text-muted">{timeAgo(r.created_at)}</td>
                      <td>
                        {r.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
                              onClick={() => adminAction('delete', r.reportable_type, r.reportable_id)}>
                              <Trash2 size={14} /> Delete
                            </button>
                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}
                              onClick={() => adminAction('resolve_report', 'report', r.id)}>
                              <CheckCircle size={14} /> Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Votes</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} style={{ opacity: p.is_deleted ? 0.5 : 1 }}>
                      <td style={{ maxWidth: '20rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </td>
                      <td>{p.profiles?.full_name || p.profiles?.username || 'Unknown'}</td>
                      <td>{p.upvotes}</td>
                      <td>
                        {p.is_deleted ?
                          <span className="badge badge-danger">Deleted</span> :
                          <span className="badge badge-success">Active</span>
                        }
                      </td>
                      <td className="text-sm text-muted">{timeAgo(p.created_at)}</td>
                      <td>
                        {!p.is_deleted && (
                          <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
                            onClick={() => adminAction('delete', 'post', p.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* JL Entries Tab */}
          {activeTab === 'entries' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Stream</th>
                    <th>Location</th>
                    <th>JL Status</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} style={{ opacity: e.is_deleted ? 0.5 : 1 }}>
                      <td>{e.profiles?.full_name || e.profiles?.username || 'Unknown'}</td>
                      <td><span className="badge badge-primary">{e.stream || 'N/A'}</span></td>
                      <td>{e.assigned_location || e.preferred_location || 'N/A'}</td>
                      <td>
                        <span className={`badge ${e.jl_status === 'Received' ? 'badge-success' : 'badge-warning'}`}>
                          {e.jl_status}
                        </span>
                      </td>
                      <td>
                        {e.is_deleted ?
                          <span className="badge badge-danger">Deleted</span> :
                          <span className="badge badge-success">Active</span>
                        }
                      </td>
                      <td className="text-sm text-muted">{timeAgo(e.created_at)}</td>
                      <td>
                        {!e.is_deleted && (
                          <button className="btn btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}
                            onClick={() => adminAction('delete', 'entry', e.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
