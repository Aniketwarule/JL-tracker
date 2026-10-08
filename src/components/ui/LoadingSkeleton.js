export default function LoadingSkeleton({ width = '100%', height = '1rem', count = 1, style = {} }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width,
            height,
            marginBottom: i < count - 1 ? 'var(--spacing-2)' : 0,
            ...style
          }}
        />
      ))}
    </>
  )
}
