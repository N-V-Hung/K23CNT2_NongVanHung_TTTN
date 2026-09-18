import { Server, Shield, Database, Network, AlertTriangle, Terminal } from 'lucide-react'

const actions = [
  { icon: Server, label: 'Kiểm tra server', prompt: 'Kiểm tra trạng thái tất cả server production' },
  { icon: Shield, label: 'Bảo mật', prompt: 'Phân tích log bảo mật 24h qua và cảnh báo bất thường' },
  { icon: Database, label: 'Backup DB', prompt: 'Kiểm tra tình trạng backup database tuần này' },
  { icon: Network, label: 'Mạng', prompt: 'Chẩn đoán sự cố mạng và độ trễ kết nối' },
  { icon: AlertTriangle, label: 'Sự cố', prompt: 'Liệt kê các sự cố hệ thống đang mở' },
  { icon: Terminal, label: 'Chạy lệnh', prompt: 'Hướng dẫn chạy lệnh kiểm tra disk usage' },
]

export default function QuickActions({ onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-6 pb-3">
      {actions.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          onClick={() => onSelect(prompt)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-accent hover:bg-dark-700 transition text-left"
        >
          <Icon size={16} className="text-accent flex-shrink-0" />
          <span className="text-xs text-gray-300">{label}</span>
        </button>
      ))}
    </div>
  )
}