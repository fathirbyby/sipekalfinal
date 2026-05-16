import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ClipboardList, Clock, CheckCircle2, PlusCircle, X, AlertCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';

const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0 });
  const [tickets, setTickets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ judul: '', kategori: 'Alat Medis', lokasi: '', prioritas: 'sedang', deskripsi: '', tgl_kejadian: '' });

  const fetchData = async () => {
    const [dashData, ticketData] = await Promise.all([
      apiFetch('/dashboard'),
      apiFetch('/tickets')
    ]);
    if (dashData?.stats) setStats(dashData.stats);
    if (Array.isArray(ticketData)) setTickets(ticketData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', ...form })
    });
    setSubmitting(false);
    if (result) {
      setShowForm(false);
      setForm({ judul: '', kategori: 'Alat Medis', lokasi: '', prioritas: 'sedang', deskripsi: '', tgl_kejadian: '' });
      fetchData();
    }
  };

  const statusColor: Record<string, string> = {
    menunggu: 'bg-slate-100 text-slate-600',
    ditugaskan: 'bg-blue-100 text-blue-600',
    diproses: 'bg-amber-100 text-amber-600',
    selesai_teknisi: 'bg-purple-100 text-purple-600',
    tertutup: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <Layout role="user">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Saya</h1>
            <p className="text-slate-500">Buat dan pantau laporan kerusakan fasilitas.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            <PlusCircle size={18} /> Buat Laporan
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList size={20} /></div><span className="text-xs font-bold text-slate-400">TOTAL</span></div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p><p className="text-xs text-slate-500 mt-1">Laporan Dibuat</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div><span className="text-xs font-bold text-slate-400">PROSES</span></div>
            <p className="text-3xl font-bold text-slate-900">{stats.process}</p><p className="text-xs text-slate-500 mt-1">Sedang Dikerjakan</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div><span className="text-xs font-bold text-slate-400">SELESAI</span></div>
            <p className="text-3xl font-bold text-slate-900">{stats.completed}</p><p className="text-xs text-slate-500 mt-1">Tiket Tertutup</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200"><h3 className="font-bold text-slate-800">Riwayat Laporan Saya</h3></div>
          {tickets.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="text-slate-400">Belum ada laporan. Klik &quot;Buat Laporan&quot; untuk memulai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr><th className="px-6 py-4">No. Tiket</th><th className="px-6 py-4">Judul</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Teknisi</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 text-sm">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{t.ticket_number}</td>
                      <td className="px-6 py-4"><p className="font-medium text-slate-800">{t.judul}</p><p className="text-xs text-slate-400">{t.lokasi}</p></td>
                      <td className="px-6 py-4 text-slate-600">{t.kategori}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor[t.status] || 'bg-slate-100 text-slate-600'}`}>{t.status?.toUpperCase()}</span></td>
                      <td className="px-6 py-4 text-slate-600">{t.teknisi_nama || <span className="text-slate-300">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Buat Laporan Baru</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Judul Kerusakan</label>
                  <input required value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: AC Ruang ICU Rusak" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Alat Medis</option><option>Instalasi Listrik</option><option>Plumbing</option><option>AC & Ventilasi</option><option>Bangunan</option><option>Lainnya</option>
                    </select></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                    <select value={form.prioritas} onChange={e => setForm({...form, prioritas: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option>
                    </select></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                  <input required value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Lantai / Ruangan" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kejadian</label>
                  <input type="date" required value={form.tgl_kejadian} onChange={e => setForm({...form, tgl_kejadian: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                  <textarea required rows={3} value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan masalah secara detail..." /></div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Mengirim...' : 'Kirim Laporan'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;
