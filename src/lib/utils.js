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

/**
 * Anonymizes a user's name to "Anonymous user #XXX (Initials)"
 * @param {string} userId - UUID or unique ID of the user
 * @param {string} fullName - Full name or username of the user
 * @returns {string}
 */
export function anonymizeUser(userId, fullName) {
  if (!userId) return 'Anonymous User'
  
  // Generate a consistent 3-digit number from the user ID
  const hashStr = userId.toString().slice(-4)
  const num = parseInt(hashStr, 16) % 1000
  const paddedNum = isNaN(num) ? '000' : String(num).padStart(3, '0')

  // Extract initials
  let initials = 'U'
  if (fullName && typeof fullName === 'string') {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    } else if (parts.length === 1 && parts[0].length > 0) {
      initials = parts[0][0].toUpperCase()
    }
  }

  return `Anonymous user #${paddedNum} (${initials})`
}

/**
 * Formats exact Xplore points into ranges
 * @param {number|string} points 
 * @returns {string}
 */
export function formatXplorePoints(points) {
  const p = parseInt(points, 10)
  if (isNaN(p)) return 'N/A'
  
  if (p < 500) return '<500'
  if (p < 1000) return '500-1000'
  if (p < 1500) return '1000-1500'
  if (p < 2000) return '1500-2000'
  return '>2000'
}

/**
 * Formats exact IPA score into ranges
 * @param {number|string} score 
 * @returns {string}
 */
export function formatIPAScore(score) {
  const s = parseFloat(score)
  if (isNaN(s)) return 'N/A'
  
  if (s <= 40) return '0-40'
  if (s <= 60) return '40-60'
  if (s <= 80) return '60-80'
  return '80-100'
}
