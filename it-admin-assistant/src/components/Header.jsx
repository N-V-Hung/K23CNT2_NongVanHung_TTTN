import { useEffect, useState } from 'react'
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react'

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700">
      <Icon size={14} className={color} />
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  )
}

export default function Header({ title }) {
  const [stats, setStats] = useState({ cpu: 32, ram: 58, net: 12, uptime: 99.9 })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 40) + 20,
        ram: Math.floor(Math.random() * 30) + 45,
        net: Math.floor(Math.random() * 80) + 5,
        uptime: 99.9,
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 bg-dark-800 border-b border-dark-700 px-6 flex items-center justify-between">
      <h2 className="text-white font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        <StatBadge icon={Cpu} label="CPU" value={`${stats.cpu}%`} color="text-blue-400" />
        <StatBadge icon={HardDrive} label="RAM" value={`${stats.ram}%`} color="text-purple-400" />
        <StatBadge icon={Wifi} label="NET" value={`${stats.net} MB/s`} color="text-green-400" />
        <StatBadge icon={Activity} label="Uptime" value={`${stats.uptime}%`} color="text-yellow-400" />
      </div>
    </header>
  )
}