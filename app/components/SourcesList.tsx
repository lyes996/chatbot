'use client'

interface Source {
  title: string
  url: string
  similarity: number
}

interface SourcesListProps {
  sources: Source[]
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📚 Sources</h3>
      <div style={styles.sourcesList}>
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.sourceCard}
          >
            <div style={styles.sourceHeader}>
              <span style={styles.sourceNumber}>{index + 1}</span>
              <span style={styles.similarity}>
                {Math.round(source.similarity * 100)}% match
              </span>
            </div>
            <h4 style={styles.sourceTitle}>{source.title}</h4>
            <p style={styles.sourceUrl}>{source.url}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '320px',
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#333',
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sourceCard: {
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  },
  sourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sourceNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  similarity: {
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '600',
  },
  sourceTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  sourceUrl: {
    fontSize: '12px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
