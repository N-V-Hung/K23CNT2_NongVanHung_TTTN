import Header from '../components/Header'
import { Server, Database, Activity, AlertCircle } from 'lucide-react'

const servers = [
  { name: 'web-01', ip: '10.0.1.10', cpu: 34, ram: 62, status: 'online' },
  { name: 'web-02', ip: '10.0.1.11', cpu: 28, ram: 55, status: 'online' },
  { name: 'db-01',  ip: '10.0.2.10', cpu: 45, ram: 78, status: 'warning' },
  { name: 'cache-01', ip: '10.0.3.10', cpu: 12, ram: 30, status: 'online' },
]

function Card({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{title}</span>
        <Icon size={18} className={color} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

function ProgressBar({ value, color }) {
  return (
    <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Header title="Giám sát hệ thống" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card title="Server hoạt động" value="18 / 20" icon={Server} color="text-blue-400" />
          <Card title="Database" value="6 / 6" icon={Database} color="text-green-400" />
          <Card title="Uptime" value="99.94%" icon={Activity} color="text-yellow-400" />
          <Card title="Cảnh báo" value="3" icon={AlertCircle} color="text-red-400" />
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-dark-700">
            <h3 className="font-semibold text-white">Danh sách Server</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-dark-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3">Tên</th>
                <th className="text-left px-5 py-3">IP</th>
                <th className="text-left px-5 py-3">CPU</th>
                <th className="text-left px-5 py-3">RAM</th>
                <th className="text-left px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {servers.map(s => (
                <tr key={s.name} className="border-t border-dark-700 hover:bg-dark-700/50">
                  <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.ip}</td>
                  <td className="px-5 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={s.cpu} color="bg-blue-500" />
                      <span className="text-xs text-gray-400 w-10">{s.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={s.ram} color="bg-purple-500" />
                      <span className="text-xs text-gray-400 w-10">{s.ram}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        s.status === 'online'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {s.status === 'online' ? '● Online' : '● Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}