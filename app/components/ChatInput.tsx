'use client'

import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inputWrapper}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your Confluence documentation..."
          disabled={disabled}
          rows={1}
        />
        <button
          style={{
            ...styles.button,
            opacity: disabled || !input.trim() ? 0.5 : 1,
            cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSend}
          disabled={disabled || !input.trim()}
        >
          <span style={styles.buttonIcon}>➤</span>
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    background: 'white',
  },
  inputWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    minHeight: '48px',
    maxHeight: '200px',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    height: '48px',
  },
  buttonIcon: {
    fontSize: '20px',
  },
}
