import { Loader2 } from 'lucide-react'

export default function PostLoading() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 'var(--spacing-4)' }}>
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary-500)' }} />
      <p className="text-muted font-medium">Loading post...</p>
    </div>
  )
}
