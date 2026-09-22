import { NavLink, useNavigate } from 'react-router-dom';
import {
  MessageSquare, LayoutDashboard, FileText, Settings,
  Server, Activity, LogOut, User as UserIcon, History, Users, UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const baseItems = [
    { to: '/chat', icon: MessageSquare, label: 'Trợ lý AI' },
    { to: '/history', icon: History, label: 'Lịch sử chat' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Giám sát hệ thống' },
    { to: '/logs', icon: FileText, label: 'Nhật ký' },
    { to: '/settings', icon: Settings, label: 'Cài đặt' },
    { to: '/profile', icon: UserCircle, label: 'Tài khoản' },
  ];

  const adminItems = [
    { to: '/users', icon: Users, label: 'Quản lý User' },
  ];

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
      <div className="p-5 border-b border-dark-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Server size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm">IT Admin AI</h1>
          <p className="text-xs text-gray-400">Trợ lý quản trị</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {baseItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                Quản trị
              </span>
            </div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {user && (
        <div className="p-3 border-t border-dark-700 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-900">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-accent'
            }`}>
              <UserIcon size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">
                {user.fullName || user.username}
              </div>
              <div className="text-xs text-gray-500">
                {isAdmin ? '👑 Admin' : '👤 User'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}

      <div className="px-4 py-3 border-t border-dark-700">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Activity size={14} className="text-green-500" />
          <span>Hệ thống ổn định</span>
        </div>
      </div>
    </aside>
  );
}