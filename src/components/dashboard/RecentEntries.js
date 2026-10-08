'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

export default function RecentEntries({ entries, initialVotes }) {
  const [votes, setVotes] = useState(initialVotes || {});

  const handleUpvote = (id) => {
    // Optimistic update
    setVotes(prev => ({
      ...prev,
      [id]: prev[id] ? undefined : true
    }));
    // TODO: Call API to persist vote
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="card w-full">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Recent Entries</h3>
        <p className="text-center text-muted">No recent entries found.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'received': return <span className="badge badge-success">Received</span>;
      case 'waiting': return <span className="badge badge-warning">Waiting</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card w-full overflow-x-auto">
      <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Recent Entries</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Stream</th>
              <th>Location</th>
              <th>OL Date</th>
              <th>JL Status</th>
              <th>Xplore</th>
              <th>Upvote</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td className="font-semibold">{entry.user_name || 'Anonymous'}</td>
                <td>{entry.stream}</td>
                <td>{entry.location}</td>
                <td>{formatDate(entry.ol_date)}</td>
                <td>{getStatusBadge(entry.jl_status)}</td>
                <td>{entry.xplore_points || 0}</td>
                <td>
                  <button 
                    onClick={() => handleUpvote(entry.id)}
                    className={`btn btn-ghost ${votes[entry.id] ? 'text-primary' : ''}`}
                    style={{ color: votes[entry.id] ? 'var(--color-primary-600)' : 'var(--color-text-tertiary)', padding: '4px 8px' }}
                  >
                    <ThumbsUp size={16} className={votes[entry.id] ? 'fill-current' : ''} />
                    <span className="text-xs">{entry.upvotes || 0}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
