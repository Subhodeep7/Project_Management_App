export function LoadingSpinner({ size = 16, text }) {
  return (
    <span className="loading-overlay">
      <span
        className="loading-spinner"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      />
      {text && <span>{text}</span>}
    </span>
  )
}

export function PageLoader() {
  return (
    <div style={{ minHeight: '60vh' }}>
      <LoadingSpinner size={24} text="Loading..." />
    </div>
  )
}
