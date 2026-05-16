import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ClipboardCheck, Wrench, Clock, CheckCircle2, Camera } from 'lucide-react';
import { apiFetch } from '../lib/api';

const TeknisiDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0, new: 0 });
  const [tickets, setTickets] = useState([]);
  const [completingTicket, setCompletingTicket] = useState<any>(null);
  const [catatan, setCatatan] = useState('');
  const [fotoSelesai, setFotoSelesai] = useState('');

  const fetchData = async (silent = false) => {
    const [dashData, ticketData] = await Promise.all([
      apiFetch('/dashboard'),
      apiFetch('/tickets')
    ]);
    if (dashData?.stats) setStats(dashData.stats);
    if (Array.isArray(ticketData)) setTickets(ticketData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (ticketId: number) => {
    const result = await apiFetch('/tickets', { method: 'POST', body: JSON.stringify({ action: 'accept', ticket_id: ticketId }) });
    if (result) fetchData();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'complete', ticket_id: completingTicket.id, catatan_perbaikan: catatan, foto_selesai: fotoSelesai })
    });
    if (result) { setCompletingTicket(null); setCatatan(''); setFotoSelesai(''); fetchData(); }
  };

  return (
    <Layout role="teknisi">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Teknisi</h1>
          <p className="text-slate-500">Kelola tugas perbaikan dan laporkan hasil pengerjaan Anda.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ClipboardCheck size={20} /></div><span className="text-xs font-bold text-slate-400">TUGAS BARU</span></div>
            <p className="text-2xl font-bold">{stats.new}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wrench size={20} /></div><span className="text-xs font-bold text-slate-400">PROSES</span></div>
            <p className="text-2xl font-bold">{stats.process}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div><span className="text-xs font-bold text-slate-400">SELESAI</span></div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4"><div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Clock size={20} /></div><span className="text-xs font-bold text-slate-400">TOTAL</span></div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800">Daftar Tugas Anda</h3>
          {tickets.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-xl border border-dashed border-slate-300 text-slate-400">Belum ada tugas yang di-assign ke Anda.</div>
          ) : tickets.map((t: any) => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{t.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'ditugaskan' ? 'bg-blue-100 text-blue-600' :
                    t.status === 'diproses' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>{t.status.toUpperCase()}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg">{t.judul}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span>{t.kategori}</span>
                  <span>{t.lokasi}</span>
                  <span className="text-red-500 font-medium">{t.prioritas}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {t.status === 'ditugaskan' && (
                  <button onClick={() => handleAccept(t.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Terima Tugas</button>
                )}
                {t.status === 'diproses' && (
                  <button onClick={() => setCompletingTicket(t)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">Selesaikan</button>
                )}
              </div>
            </div>
          ))}
        </div>
        {completingTicket && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Selesaikan Perbaikan</h2>
                <p className="text-sm text-slate-500 mt-1">{completingTicket.ticket_number}</p>
              </div>
              <form onSubmit={handleComplete} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Perbaikan</label>
                  <textarea required value={catatan} onChange={e => setCatatan(e.target.value)} rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan apa yang sudah diperbaiki..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL Foto Bukti (Opsional)</label>
                  <div className="relative">
                    <input value={fotoSelesai} onChange={e => setFotoSelesai(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..." />
                    <Camera size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setCompletingTicket(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Simpan &amp; Selesai</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeknisiDashboard;
