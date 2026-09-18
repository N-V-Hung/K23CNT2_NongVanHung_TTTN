import ReactMarkdown from 'react-markdown'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-5`}>
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-dark-700 text-gray-100 border border-dark-600'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="bg-dark-900 px-1.5 py-0.5 rounded text-pink-400 text-xs">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-dark-900 p-3 rounded-lg overflow-x-auto my-2 text-xs">
                        <code>{children}</code>
                      </pre>
                    ),
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
        )}
      </div>
    </div>
  )
}