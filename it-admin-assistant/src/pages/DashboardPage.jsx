import { useEffect, useState } from 'react'
import {
  Server, Database, Activity, AlertCircle, Loader2, RefreshCw,
  RotateCw, Crown, Plus, Pencil, Trash2, X, Save, Database as DbIcon,
} from 'lucide-react'
import Header from '../components/Header'
import {
  getServers, getServerCounts, getSystemStats,
  createServer, updateServer, deleteServer, restartServer,
} from '../services/api'
import { useAuth } from '../context/AuthContext'

// ===== Card thống kê =====
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
  const barColor = value >= 80 ? 'bg-red-500' : value >= 60 ? 'bg-yellow-500' : color
  return (
    <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
      <div className={`h-full transition-all ${barColor}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`bg-dark-700 animate-pulse rounded ${className}`} />
}

// ===== Modal thêm/sửa server =====
function ServerModal({ server, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: server?.name || '',
    ip: server?.ip || '',
    group: server?.group || 'web',
    status: server?.status || 'online',
    note: server?.note || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!server?.id

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) await updateServer(server.id, form)
      else await createServer(form)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md">
        <div className="p-5 border-b border-dark-700 flex items-center justify-between">
          <h3 className="font-semibold text-white">{isEdit ? 'Sửa server' : 'Thêm server mới'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tên server *</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} required
              placeholder="web-03"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">IP *</label>
            <input value={form.ip} onChange={e => update('ip', e.target.value)} required
              placeholder="10.0.1.12"
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nhóm</label>
              <select value={form.group} onChange={e => update('group', e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
                <option value="web">Web</option>
                <option value="db">Database</option>
                <option value="cache">Cache</option>
                <option value="app">Application</option>
                <option value="default">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Trạng thái</label>
              <select value={form.status} onChange={e => update('status', e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
                <option value="online">Online</option>
                <option value="warning">Cảnh báo</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Ghi chú</label>
            <textarea value={form.note} onChange={e => update('note', e.target.value)} rows={2}
              className="w-full resize-none bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{error}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [restarting, setRestarting] = useState(null)
  const [modal, setModal] = useState(null)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const [sysStats, counts, serversData] = await Promise.all([
        getSystemStats(),
        getServerCounts(),
        getServers(),
      ])

      setStats({
        cpu: sysStats.cpu,
        ram: sysStats.ram,
        net: sysStats.net,
        uptimePercent: sysStats.uptimePercent,
        totalServers: counts.total,
        onlineServers: counts.online,
        warningServers: counts.warning,
        totalDatabases: 6,
        onlineDatabases: 6,
      })
      setServers(serversData)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không load được dữ liệu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 8000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => { setRefreshing(true); load(true) }

  const handleRestart = async (server) => {
    if (!confirm(`Restart server "${server.name}"?`)) return
    setRestarting(server.id)
    try {
      const res = await restartServer(server.id)
      alert(res.message)
      load(true)
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)) }
    finally { setRestarting(null) }
  }

  const handleDelete = async (server) => {
    if (!confirm(`Xóa server "${server.name}"?`)) return
    try {
      await deleteServer(server.id)
      load(true)
    } catch (err) { alert('Lỗi: ' + (err.response?.data?.message || err.message)) }
  }

  const filteredServers = servers.filter(s => filter === 'all' || s.status === filter)

  return (
    <>
      <Header title="Giám sát hệ thống" />
      <div className="flex-1 overflow-y-auto p-6">

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* 4 thẻ stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <Card title="Server hoạt động" value={`${stats?.onlineServers ?? 0} / ${stats?.totalServers ?? 0}`} icon={Server} color="text-blue-400" />
              <Card title="Database" value={`${stats?.onlineDatabases ?? 0} / ${stats?.totalDatabases ?? 0}`} icon={Database} color="text-green-400" />
              <Card title="Uptime" value={`${stats?.uptimePercent ?? 99.9}%`} icon={Activity} color="text-yellow-400" />
              <Card title="Cảnh báo" value={stats?.warningServers ?? 0} icon={AlertCircle} color="text-red-400" />
            </>
          )}
        </div>

        {/* Bảng server */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-dark-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">Danh sách Server</h3>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <DbIcon size={12} /> MongoDB · {servers.length} server
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-dark-900 rounded-lg p-1">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'online', label: 'Online' },
                  { key: 'warning', label: 'Cảnh báo' },
                  { key: 'offline', label: 'Offline' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-md text-xs transition ${
                      filter === f.key ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>

              <button onClick={handleRefresh} disabled={refreshing}
                className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 disabled:opacity-50">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {isAdmin && (
                <button onClick={() => setModal({})}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium">
                  <Plus size={14} /> Thêm server
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="p-5 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!loading && filteredServers.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-dark-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Tên</th>
                  <th className="text-left px-5 py-3">IP</th>
                  <th className="text-left px-5 py-3">Nhóm</th>
                  <th className="text-left px-5 py-3">CPU</th>
                  <th className="text-left px-5 py-3">RAM</th>
                  <th className="text-left px-5 py-3">Trạng thái</th>
                  {isAdmin && <th className="text-right px-5 py-3">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {filteredServers.map(s => (
                  <tr key={s.id} className="border-t border-dark-700 hover:bg-dark-700/50">
                    <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.ip}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-dark-700 text-gray-400">{s.group}</span>
                    </td>
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        s.status === 'online' ? 'bg-green-500/20 text-green-400'
                        : s.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}>
                        ● {s.status === 'online' ? 'Online' : s.status === 'warning' ? 'Cảnh báo' : 'Offline'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleRestart(s)} disabled={restarting === s.id}
                            className="p-2 rounded-lg hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400" title="Restart">
                            <RotateCw size={15} className={restarting === s.id ? 'animate-spin' : ''} />
                          </button>
                          <button onClick={() => setModal({ server: s })}
                            className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400" title="Sửa">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(s)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400" title="Xóa">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredServers.length === 0 && (
            <div className="p-10 text-center text-gray-500 text-sm">
              {servers.length === 0 ? (
                isAdmin ? (
                  <>Chưa có server nào. Bấm <strong className="text-white">"Thêm server"</strong> để tạo mới.</>
                ) : 'Chưa có server nào. Liên hệ admin.'
              ) : `Không có server nào khớp với filter "${filter}"`}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          {isAdmin ? (
            <>
              <Crown size={12} className="text-yellow-400" />
              <span>Bạn là <strong className="text-yellow-400">Admin</strong> — có thể thêm, sửa, xóa, restart server.</span>
            </>
          ) : (
            <span>Chế độ xem — liên hệ admin để thay đổi server.</span>
          )}
          <span className="ml-auto">Tự động cập nhật mỗi 8 giây</span>
        </div>
      </div>

      {modal && (
        <ServerModal server={modal.server} onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(true) }} />
      )}
    </>
  )
}