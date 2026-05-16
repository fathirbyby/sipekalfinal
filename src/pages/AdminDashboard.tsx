import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { apiFetch } from '../lib/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0, pending: 0 });
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedTech, setSelectedTech] = useState('');

  const fetchData = async (silent = false) => {
    const [dashData, ticketData, techData] = await Promise.all([
      apiFetch('/dashboard'),
      apiFetch('/tickets'),
      apiFetch('/users')
    ]);
    if (dashData?.stats) { setStats(dashData.stats); setCategories(dashData.categories || []); }
    if (Array.isArray(ticketData)) setTickets(ticketData);
    if (Array.isArray(techData)) setTechnicians(techData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async () => {
    if (!selectedTech || !selectedTicket) return;
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'assign', ticket_id: selectedTicket.id, teknisi_id: parseInt(selectedTech) })
    });
    if (result) { setSelectedTicket(null); setSelectedTech(''); fetchData(); }
  };

  return (
    <Layout role="admin">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administrator Console</h1>
          <p className="text-slate-500">Kelola tiket, disposisi teknisi, dan pantau kinerja sistem.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList size={20} /></div><span className="text-xs font-bold text-slate-400">TOTAL</span></div>
            <p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-slate-500 mt-1">Keseluruhan Tiket</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={20} /></div><span className="text-xs font-bold text-slate-400">PENDING</span></div>
            <p className="text-2xl font-bold">{stats.pending}</p><p className="text-xs text-slate-500 mt-1">Menunggu Disposisi</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={20} /></div><span className="text-xs font-bold text-slate-400">PROSES</span></div>
            <p className="text-2xl font-bold">{stats.process}</p><p className="text-xs text-slate-500 mt-1">Sedang Dikerjakan</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div><span className="text-xs font-bold text-slate-400">SELESAI</span></div>
            <p className="text-2xl font-bold">{stats.completed}</p><p className="text-xs text-slate-500 mt-1">Tiket Tertutup</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200"><h3 className="font-bold text-slate-800">Manajemen Tiket</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tiket</th><th className="px-6 py-4">Pelapor</th>
                    <th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Belum ada tiket masuk.</td></tr>
                  ) : tickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 text-sm">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.ticket_number}</td>
                      <td className="px-6 py-4"><p className="font-medium">{t.pelapor_nama}</p><p className="text-[10px] text-slate-400">{t.lokasi}</p></td>
                      <td className="px-6 py-4 text-slate-600">{t.kategori}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'menunggu' ? 'bg-slate-100 text-slate-600' :
                          t.status === 'ditugaskan' ? 'bg-blue-100 text-blue-600' :
                          t.status === 'diproses' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>{t.status.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {t.status === 'menunggu' ? (
                          <button onClick={() => setSelectedTicket(t)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Disposisi</button>
                        ) : (
                          <span className="text-xs text-slate-400">{t.teknisi_nama || '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><ArrowRight size={18} className="text-blue-600" /> Kategori Terbanyak</h3>
              <div className="space-y-4">
                {categories.length === 0 ? <p className="text-sm text-slate-400 text-center py-4">Belum ada data.</p> :
                  categories.map((c: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{c.kategori}</span><span className="font-bold">{c.count}</span></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: stats.total ? `${(c.count / stats.total) * 100}%` : '0%' }}></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center gap-3 mb-4"><Users className="text-blue-400" /><h3 className="font-bold">Status Teknisi</h3></div>
              <div className="space-y-3">
                {technicians.length === 0 ? <p className="text-sm text-slate-400">Belum ada teknisi.</p> :
                  technicians.map((tech: any) => (
                    <div key={tech.id} className="flex items-center justify-between text-sm border-b border-white/10 pb-2 last:border-0">
                      <span>{tech.nama_lengkap}</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">AKTIF</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Disposisi Tiket</h2>
                <p className="text-sm text-slate-500 mt-1">Pilih teknisi untuk {selectedTicket.ticket_number}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Teknisi</label>
                  <select value={selectedTech} onChange={e => setSelectedTech(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Teknisi --</option>
                    {technicians.map((tech: any) => <option key={tech.id} value={tech.id}>{tech.nama_lengkap}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={() => { setSelectedTicket(null); setSelectedTech(''); }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
                  <button onClick={handleAssign} disabled={!selectedTech}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Tugaskan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
