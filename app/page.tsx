'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import SourcesList from './components/SourcesList'
import Header from './components/Header'

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSources, setCurrentSources] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setCurrentSources([])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'sources') {
                  setCurrentSources(parsed.sources)
                  assistantMessage.sources = parsed.sources
                } else if (parsed.type === 'content') {
                  assistantMessage.content += parsed.content
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = { ...assistantMessage }
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure Ollama is running and try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <Header />
      
      <div style={styles.mainContent}>
        <div style={styles.chatContainer}>
          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div style={styles.welcomeMessage}>
                <h2 style={styles.welcomeTitle}>👋 Welcome to Confluence Chatbot</h2>
                <p style={styles.welcomeText}>
                  Ask me anything about your Confluence documentation!
                </p>
                <div style={styles.exampleQuestions}>
                  <p style={styles.exampleTitle}>Try asking:</p>
                  <ul style={styles.exampleList}>
                    <li>"How do I set up the development environment?"</li>
                    <li>"What are the deployment procedures?"</li>
                    <li>"Where can I find the API documentation?"</li>
                  </ul>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div style={styles.loadingIndicator}>
                <div style={styles.loadingDot}></div>
                <div style={styles.loadingDot}></div>
                <div style={styles.loadingDot}></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>

        {currentSources.length > 0 && (
          <SourcesList sources={currentSources} />
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    gap: '20px',
    padding: '20px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    minWidth: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  welcomeMessage: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  welcomeTitle: {
    fontSize: '32px',
    marginBottom: '16px',
    color: '#333',
  },
  welcomeText: {
    fontSize: '18px',
    marginBottom: '32px',
  },
  exampleQuestions: {
    textAlign: 'left',
    maxWidth: '600px',
    margin: '0 auto',
    background: '#f8f9fa',
    padding: '24px',
    borderRadius: '12px',
  },
  exampleTitle: {
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  },
  exampleList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  loadingIndicator: {
    display: 'flex',
    gap: '8px',
    padding: '20px',
    justifyContent: 'center',
  },
  loadingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#667eea',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
}
