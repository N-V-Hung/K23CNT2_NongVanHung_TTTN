import { useState } from 'react';
import { Save } from 'lucide-react';
import Header from '../components/Header';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:8000/api',
    model: 'gemini',
    autoApprove: false,
    notifications: true,
  });

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleSave = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    alert('Đã lưu cài đặt');
  };

  return (
    <>
      <Header title="Cài đặt" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">

          {/* Kết nối API */}
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Kết nối API</h3>

            <label className="block mb-4">
              <span className="text-sm text-gray-400 mb-1 block">API URL Backend</span>
              <input
                value={settings.apiUrl}
                onChange={e => update('apiUrl', e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-400 mb-1 block">AI Model</span>
              <select
                value={settings.model}
                onChange={e => update('model', e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="gemini">Gemini 1.5 Flash</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
                <option value="local">Local LLM (Ollama)</option>
              </select>
            </label>
          </section>

          {/* Hành vi */}
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Hành vi</h3>

            {[
              { key: 'autoApprove', label: 'Tự động thực thi lệnh an toàn', desc: 'AI có thể chạy lệnh chỉ đọc không cần xác nhận' },
              { key: 'notifications', label: 'Thông báo cảnh báo', desc: 'Nhận thông báo khi phát hiện sự cố' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
                <div>
                  <div className="text-sm text-white">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => update(item.key, !settings[item.key])}
                  className={`w-11 h-6 rounded-full transition ${
                    settings[item.key] ? 'bg-accent' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      settings[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </section>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </>
  );
}