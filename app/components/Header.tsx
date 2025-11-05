'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'unknown' }))
  }, [])

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🤖</span>
          <h1 style={styles.title}>Confluence Chatbot</h1>
        </div>
        
        {health && (
          <div style={styles.statusContainer}>
            <div style={{
              ...styles.statusDot,
              background: health.status === 'healthy' ? '#10b981' : '#ef4444'
            }} />
            <span style={styles.statusText}>
              {health.status === 'healthy' ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '16px 20px',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '20px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
}
