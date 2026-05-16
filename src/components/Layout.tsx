import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Users,
  Bell,
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'user' | 'teknisi';
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const menuItems = {
    admin: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
      { icon: <ClipboardList size={20} />, label: 'Manajemen Tiket', path: '/admin' },
      { icon: <Users size={20} />, label: 'Data Teknisi', path: '/admin' },
    ],
    user: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/user' },
      { icon: <ClipboardList size={20} />, label: 'Riwayat Laporan', path: '/user' },
    ],
    teknisi: [
      { icon: <LayoutDashboard size={20} />, label: 'Tugas Saya', path: '/teknisi' },
      { icon: <ClipboardList size={20} />, label: 'Riwayat Kerja', path: '/teknisi' },
    ]
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Activity className="text-blue-500" />
          <span className="font-bold text-xl tracking-tight">SIPEKAL</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems[role].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
              {user.nama_lengkap?.[0] || '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.nama_lengkap}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800 md:hidden">SIPEKAL</h2>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
            </button>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
