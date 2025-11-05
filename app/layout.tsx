import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Confluence Chatbot - RAG System',
  description: 'AI-powered chatbot for Confluence documentation using RAG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
