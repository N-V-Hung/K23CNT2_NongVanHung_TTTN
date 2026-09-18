import Header from '../components/Header'
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react'

const logs = [
  { level: 'info', time: '14:32:11', source: 'nginx', msg: 'Request GET /api/users - 200 OK' },
  { level: 'error', time: '14:31:45', source: 'mysql', msg: 'Slow query detected (>5s): SELECT * FROM orders' },
  { level: 'warn', time: '14:30:22', source: 'auth', msg: 'Failed login attempt from 192.168.45.12' },
  { level: 'info', time: '14:29:10', source: 'systemd', msg: 'Service web-01 restarted successfully' },
  { level: 'success', time: '14:28:05', source: 'backup', msg: 'Database backup completed in 12m 34s' },
  { level: 'error', time: '14:25:33', source: 'redis', msg: 'Connection timeout to cache-02' },
  { level: 'warn', time: '14:22:18', source: 'disk', msg: 'Disk usage at 82% on /var/log' },
]

const levelConfig = {
  info: { icon: Info, color: 'text-blue-400 bg-blue-500/10' },
  warn: { icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-500/10' },
  error: { icon: XCircle, color: 'text-red-400 bg-red-500/10' },
  success: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10' },
}

export default function LogsPage() {
  return (
    <>
      <Header title="Nhật ký hệ thống" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl">
          <div className="p-5 border-b border-dark-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Log Realtime</h3>
            <span className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Đang theo dõi
            </span>
          </div>
          <div className="divide-y divide-dark-700">
            {logs.map((log, i) => {
              const { icon: Icon, color } = levelConfig[log.level]
              return (
                <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-dark-700/40">
                  <div className={`p-1.5 rounded ${color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-mono">{log.time}</span>
                      <span className="text-xs text-gray-400 font-mono">[{log.source}]</span>
                    </div>
                    <p className="text-sm text-gray-200 break-all">{log.msg}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}