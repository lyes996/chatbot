'use client'

import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    title: string
    url: string
    similarity: number
  }>
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const renderContent = () => {
    if (isUser) {
      return <p style={styles.text}>{message.content}</p>
    }

    // Render markdown for assistant messages
    const html = marked(message.content, { breaks: true })
    const sanitized = DOMPurify.sanitize(html as string)

    return (
      <div
        style={styles.markdown}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    )
  }

  return (
    <div style={{
      ...styles.container,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        ...styles.message,
        background: isUser ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
        color: isUser ? 'white' : '#333',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
      }}>
        {!isUser && (
          <div style={styles.avatar}>🤖</div>
        )}
        <div style={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    width: '100%',
    marginBottom: '8px',
  },
  message: {
    maxWidth: '80%',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  avatar: {
    fontSize: '24px',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    margin: 0,
    lineHeight: '1.6',
    wordWrap: 'break-word',
  },
  markdown: {
    lineHeight: '1.6',
    wordWrap: 'break-word',
  },
}
