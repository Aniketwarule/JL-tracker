import Link from 'next/link'

export default function EmptyState({ icon: Icon, title, description, actionText, actionHref }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-12) var(--spacing-4)',
      textAlign: 'center'
    }}>
      {Icon && (
        <div style={{ color: 'var(--color-text-tertiary)', opacity: 0.5, marginBottom: 'var(--spacing-4)' }}>
          <Icon size={48} />
        </div>
      )}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-muted" style={{ maxWidth: '24rem', marginBottom: 'var(--spacing-4)' }}>
          {description}
        </p>
      )}
      {actionText && actionHref && (
        <Link href={actionHref} className="btn btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  )
}
