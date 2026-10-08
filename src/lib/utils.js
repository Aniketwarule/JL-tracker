/**
 * Returns a human-readable relative time string
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 5) return `${diffWeek}w ago`
  if (diffMonth < 12) return `${diffMonth}mo ago`
  return formatDate(date)
}

/**
 * Formats a date string as DD/MM/YYYY
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return 'N/A'
  
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  return `${day}/${month}/${year}`
}

/**
 * Builds a nested comment tree from flat comments array
 * @param {Array} comments - flat array with parent_comment_id
 * @returns {Array} nested tree
 */
export function buildCommentTree(comments) {
  const map = {}
  const roots = []

  comments.forEach(c => {
    map[c.id] = { ...c, replies: [] }
  })

  comments.forEach(c => {
    if (c.parent_comment_id && map[c.parent_comment_id]) {
      map[c.parent_comment_id].replies.push(map[c.id])
    } else {
      roots.push(map[c.id])
    }
  })

  return roots
}

/** List of TCS locations */
export const LOCATIONS = [
  'Hyderabad', 'Pune', 'Kolkata', 'Chennai', 'Mumbai',
  'Bangalore', 'Lucknow', 'Trivandrum', 'Kochi', 'Ahmedabad',
  'Bhubaneswar', 'Guwahati', 'Noida', 'Indore', 'Coimbatore', 'Other'
]
