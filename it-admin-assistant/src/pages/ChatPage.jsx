import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import MessageBubble from '../components/MessageBubble'
import QuickActions from '../components/QuickActions'
import { sendChatMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'

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

// Key lưu tin nhắn theo user
const chatKey = (userId) => `chat_session_${userId}`

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const initialized = useRef(false)

  // ===== Khởi tạo: đọc từ sessionStorage khi mount =====
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (!user) {
      setMessages([WELCOME])
      return
    }

    try {
      const saved = sessionStorage.getItem(chatKey(user.id))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (err) {
      console.error('Không đọc được cache chat:', err)
    }
    setMessages([WELCOME])
  }, [user?.id])

  // ===== Khi user thay đổi (login user khác / logout) → reset =====
  useEffect(() => {
    if (!user) {
      setMessages([WELCOME])
      setInput('')
      return
    }
  }, [user?.id])

  // ===== Tự động lưu vào sessionStorage mỗi khi messages thay đổi =====
  useEffect(() => {
    if (!user) return
    try {
      sessionStorage.setItem(chatKey(user.id), JSON.stringify(messages))
    } catch (err) {
      console.error('Không lưu được cache chat:', err)
    }
  }, [messages, user?.id])

  // Auto-scroll
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
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi kết nối tới server'
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errMsg}` }])
    } finally {
      setLoading(false)
    }
  }

  // Xóa hội thoại trên màn hình (không xóa lịch sử server)
  const handleClear = () => {
    if (!confirm('Xóa hội thoại đang hiển thị trên màn hình?')) return
    setMessages([WELCOME])
    if (user) sessionStorage.removeItem(chatKey(user.id))
  }

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
              title="Xóa màn hình chat"
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
                className="absolute right-2 bottom-2 p-2 rounded-md bg-accent hover:bg-accent-hover disabled:opacity-40 text-white transition"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            Tin nhắn tự động lưu vào **Lịch sử chat** — xem ở menu trái.
          </p>
        </div>
      </div>
    </>
  )
}