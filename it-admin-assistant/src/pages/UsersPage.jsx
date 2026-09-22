import { useEffect, useState } from 'react';
import {
  Users, Loader2, Trash2, Lock, Unlock, RefreshCw,
  ShieldCheck, User as UserIcon, AlertCircle, Crown,
} from 'lucide-react';
import Header from '../components/Header';
import { listUsers, toggleUserActive, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  // Chặn nếu không phải admin
  useEffect(() => {
    if (currentUser && !isAdmin) {
      alert('Chỉ admin mới có quyền truy cập');
      navigate('/chat');
    }
  }, [currentUser, isAdmin, navigate]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không load được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser?.id]);

  const handleToggle = async (u) => {
    if (u.id === currentUser.id) {
      alert('Không thể tự khóa chính mình');
      return;
    }
    const action = u.isActive ? 'khóa' : 'mở khóa';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản "${u.username}"?`)) return;

    try {
      const updated = await toggleUserActive(u.id);
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser.id) {
      alert('Không thể tự xóa chính mình');
      return;
    }
    if (!confirm(`Xóa vĩnh viễn user "${u.username}"?\nToàn bộ tin nhắn chat của user này cũng sẽ bị xóa.`)) return;

    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <>
      <Header title="Quản lý User" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Tổng user</span>
                <Users size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Đang hoạt động</span>
                <ShieldCheck size={16} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.active}</div>
            </div>
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Admin</span>
                <Crown size={16} className="text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.admins}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Danh sách người dùng</h2>
            <button
              onClick={load}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm transition"
            >
              <RefreshCw size={14} />
              Tải lại
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-20 gap-2 text-gray-400">
              <Loader2 className="animate-spin text-accent" size={20} />
              <span>Đang tải danh sách...</span>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Lỗi load danh sách</p>
                <p className="text-xs mt-1 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Chưa có user nào
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-dark-900 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">Người dùng</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Trạng thái</th>
                    <th className="text-right px-5 py-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isMe = u.id === currentUser?.id;
                    return (
                      <tr
                        key={u.id}
                        className={`border-t border-dark-700 hover:bg-dark-700/50 ${
                          !u.isActive ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                                : 'bg-blue-600'
                            }`}>
                              {u.role === 'admin' ? <Crown size={14} /> : <UserIcon size={14} />}
                            </div>
                            <div>
                              <div className="text-white font-medium flex items-center gap-2">
                                {u.username}
                                {isMe && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {u.fullName || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                          {u.email}
                        </td>
                        <td className="px-5 py-3">
                          {u.role === 'admin' ? (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 inline-flex items-center gap-1">
                              <Crown size={10} /> Admin
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {u.isActive ? (
                            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                              ● Hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                              ● Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggle(u)}
                              disabled={isMe}
                              className={`p-2 rounded-lg transition ${
                                isMe
                                  ? 'opacity-30 cursor-not-allowed'
                                  : u.isActive
                                  ? 'hover:bg-yellow-500/20 text-yellow-400'
                                  : 'hover:bg-green-500/20 text-green-400'
                              }`}
                              title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                            >
                              {u.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              disabled={isMe}
                              className={`p-2 rounded-lg transition ${
                                isMe
                                  ? 'opacity-30 cursor-not-allowed'
                                  : 'hover:bg-red-500/20 text-red-400'
                              }`}
                              title="Xóa user"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            💡 Bạn không thể tự khóa hoặc xóa chính mình. Người dùng đầu tiên đăng ký tự động là Admin.
          </p>
        </div>
      </div>
    </>
  );
}