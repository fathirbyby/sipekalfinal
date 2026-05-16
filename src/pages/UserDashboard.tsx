import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { PlusCircle, Clock, CheckCircle2, FileText } from 'lucide-react';
import { apiFetch } from '../lib/api';

const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, process: 0 });
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Alat Medis');
  const [lokasi, setLokasi] = useState('');
  const [prioritas, setPrioritas] = useState('Sedang');
  const [deskripsi, setDeskripsi] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', judul, kategori, lokasi, prioritas, deskripsi, tgl_kejadian: new Date().toISOString() })
    });
    if (result && !result.error) {
      setShowForm(false);
      setJudul(''); setLokasi(''); setDeskripsi('');
      fetchData();
    }
  };

  const handleClose = async (ticketId: number) => {
    if (!confirm('Konfirmasi masalah sudah terselesaikan?')) return;
    const result = await apiFetch('/tickets', { method: 'POST', body: JSON.stringify({ action: 'close', ticket_id: ticketId }) });
    if (result) fetchData();
  };

  return (
    <Layout role="user">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Unit</h1>
            <p className="text-slate-500">Pantau dan laporkan kerusakan alat di unit Anda.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
            <PlusCircle size={20} /> Buat Laporan
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText /></div>
            <div><p className="text-sm text-slate-500">Total Laporan</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock /></div>
            <div><p className="text-sm text-slate-500">Dalam Proses</p><p className="text-2xl font-bold">{stats.process}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 /></div>
            <div><p className="text-sm text-slate-500">Terselesaikan</p><p className="text-2xl font-bold">{stats.completed}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200"><h3 className="font-bold text-slate-800">Riwayat Pelaporan</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Tiket</th>
                  <th className="px-6 py-4">Judul / Kategori</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Teknisi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Belum ada tiket laporan.</td></tr>
                ) : tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{t.ticket_number}</td>
                    <td className="px-6 py-4"><p className="font-medium text-slate-800">{t.judul}</p><p className="text-xs text-slate-500">{t.kategori}</p></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.lokasi}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'menunggu' ? 'bg-slate-100 text-slate-600' :
                        t.status === 'ditugaskan' ? 'bg-blue-50 text-blue-600' :
                        t.status === 'diproses' ? 'bg-amber-50 text-amber-600' :
                        t.status === 'selesai_teknisi' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>{t.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.teknisi_nama || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      {t.status === 'selesai_teknisi' && (
                        <button onClick={() => handleClose(t.id)} className="text-emerald-600 hover:underline text-sm font-bold mr-3">Verifikasi</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-slate-900">Buat Laporan Baru</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul Kerusakan</label>
                  <input required value={judul} onChange={e => setJudul(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: AC Mati Total" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select value={kategori} onChange={e => setKategori(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Alat Medis</option>
                      <option>Alat Non-Medis</option>
                      <option>Fasilitas Gedung</option>
                      <option>Lingkungan</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                    <select value={prioritas} onChange={e => setPrioritas(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Rendah</option>
                      <option>Sedang</option>
                      <option>Tinggi</option>
                      <option>Darurat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi / Ruangan</label>
                  <input required value={lokasi} onChange={e => setLokasi(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Ruang Radiologi Lt. 2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Kerusakan</label>
                  <textarea required value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan detail kerusakan..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
                  <button type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kirim Laporan</button>
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
