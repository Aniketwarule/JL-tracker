export default function Badge({ status, children }) {
  const variantMap = {
    'Received': 'badge-success',
    'Completed': 'badge-success',
    'Given': 'badge-success',
    'Waiting': 'badge-warning',
    'Pending': 'badge-warning',
    'Not Given': 'badge-danger',
    'Not Started': 'badge-danger',
    'Digital': 'badge-primary',
    'Ninja': 'badge-info',
    'Prime': 'badge-primary',
  }

  const className = variantMap[status] || 'badge-neutral'

  return (
    <span className={`badge ${className}`}>
      {children || status}
    </span>
  )
}
