import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import MessageBubble from '../components/MessageBubble'
import QuickActions from '../components/QuickActions'
import { sendChatMessage } from '../services/api'

const WELCOME = {
  role: 'assistant',
  content: `Xin chào! 👋 Tôi là **trợ lý AI quản trị hệ thống CNTT** của bạn.

Tôi có thể hỗ trợ:
- Kiểm tra trạng thái **server**, **service**
- Phân tích **log**, **bảo mật**
- Quản lý **backup**, **database**
- Chẩn đoán **mạng**, **hiệu năng**

Hãy hỏi tôi bất cứ điều gì hoặc chọn hành động nhanh bên dưới.`,
}

export default function ChatPage() {
  const [messages, setMessages] = useState(() => {
  // Đọc từ localStorage khi mở lại
  try {
    const saved = localStorage.getItem('chat_messages')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Lỗi đọc chat history:', err)
  }
  return [WELCOME]
})

// Tự động lưu mỗi khi messages thay đổi
useEffect(() => {
  try {
    localStorage.setItem('chat_messages', JSON.stringify(messages))
  } catch (err) {
    console.error('Lỗi lưu chat history:', err)
  }
}, [messages])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(content, messages)
      setMessages(prev => [...prev, { role: 'assistant', content: res.content }])
    } catch (err) {
      const errMsg = err.response?.data?.message || '❌ Có lỗi xảy ra khi kết nối tới server. Vui lòng thử lại.'
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Có lỗi xảy ra khi kết nối tới server. Vui lòng thử lại.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => setMessages([WELCOME])

  return (
    <>
      <Header title="Trợ lý AI" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-4xl mx-auto">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}

            {loading && (
              <div className="flex gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="bg-dark-700 border border-dark-600 rounded-2xl px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {messages.length <= 1 && <QuickActions onSelect={handleSend} />}

        <div className="border-t border-dark-700 bg-dark-800 p-4">
          <div className="max-w-4xl mx-auto flex gap-2 items-end">
            <button
              onClick={handleClear}
              className="p-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 transition"
              title="Xóa hội thoại"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Nhập yêu cầu... (Shift+Enter để xuống dòng)"
                rows={1}
                className="w-full resize-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent max-h-32"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 bottom-2 p-2 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            AI có thể mắc lỗi. Hãy xác minh các hành động quan trọng.
          </p>
        </div>
      </div>
    </>
  )
}