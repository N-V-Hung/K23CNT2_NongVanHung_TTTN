import { useEffect, useState } from 'react';
import { Clock, Loader2, Trash2, User as UserIcon, Bot, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import { getChatHistory, clearChatHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getChatHistory(200);
      setMessages(data);
    } catch (err) {
      console.error('Lỗi load lịch sử:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user?.id]);

  const handleClear = async () => {
    if (!confirm('Xóa toàn bộ lịch sử chat? Không thể hoàn tác.')) return;
    try {
      await clearChatHistory();
      setMessages([]);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Nhóm theo ngày
  const grouped = messages.reduce((acc, m) => {
    const day = new Date(m.createdAt).toLocaleDateString('vi-VN');
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  return (
    <>
      <Header title="Lịch sử chat" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400">
                Lịch sử chat của <strong className="text-white">{user?.username}</strong> — {messages.length} tin nhắn
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={load}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm transition"
              >
                <RefreshCw size={14} />
                Tải lại
              </button>
              <button
                onClick={handleClear}
                disabled={messages.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition disabled:opacity-40"
              >
                <Trash2 size={14} />
                Xóa tất cả
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Clock size={40} className="mx-auto mb-3 opacity-40" />
              <p>Chưa có lịch sử chat</p>
              <p className="text-xs mt-2">Hãy vào trang "Trợ lý AI" để bắt đầu chat</p>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([day, msgs]) => (
            <div key={day} className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <Clock size={12} />
                <span className="font-medium">{day}</span>
                <span className="text-gray-600">({msgs.length} tin nhắn)</span>
                <div className="flex-1 h-px bg-dark-700" />
              </div>
              <div className="space-y-2">
                {msgs.map(m => (
                  <div
                    key={m.id || m._id}
                    className="flex gap-3 p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-dark-600 transition"
                  >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      m.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
                    }`}>
                      {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">
                        {m.role === 'user' ? 'Bạn' : 'AI'} · {new Date(m.createdAt).toLocaleTimeString('vi-VN')}
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}