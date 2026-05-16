import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/api';

const TicketDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTicket = async () => {
    const data = await apiFetch(`/tickets`);
    if (data && Array.isArray(data)) {
      const found = data.find((t: any) => t.id === parseInt(id!));
      setTicket(found || null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleClose = async () => {
    const result = await apiFetch('/tickets', {
      method: 'POST',
      body: JSON.stringify({ action: 'close', ticket_id: ticket.id })
    });
    if (result) fetchTicket();
  };

  if (loading) return <div className="p-20 text-center text-slate-500">Memuat data tiket...</div>;
  if (!ticket) return <div className="p-20 text-center text-red-500">Tiket tidak ditemukan.</div>;

  return (
    <Layout role={user.role}>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /> Kembali
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{ticket.ticket_number}</span>
                <h1 className="text-3xl font-bold text-slate-900 mt-2">{ticket.judul}</h1>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={16} /> {ticket.lokasi}</span>
                  <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(ticket.tgl_kejadian).toLocaleDateString('id-ID')}</span>
                  <span className="font-bold text-red-500">{ticket.prioritas}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                  ticket.status === 'tertutup' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
                {user.role === 'user' && ticket.status === 'selesai_teknisi' && (
                  <button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    Konfirmasi &amp; Tutup Tiket
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Deskripsi Masalah</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{ticket.deskripsi}</p>
              </div>
            </div>
            <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
              <div className="relative">
                <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                <p className="text-xs font-bold text-slate-400">LAPORAN DIBUAT</p>
                <p className="text-sm font-medium text-slate-800">{ticket.pelapor_nama || 'User'}</p>
              </div>
              {ticket.teknisi_id && (
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-slate-400">TEKNISI DITUGASKAN</p>
                  <p className="text-sm font-medium text-slate-800">{ticket.teknisi_nama}</p>
                </div>
              )}
              {(ticket.status === 'selesai_teknisi' || ticket.status === 'tertutup') && (
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
                  <p className="text-xs font-bold text-slate-400">PEKERJAAN SELESAI</p>
                  <div className="mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800 mb-1">Catatan Teknisi:</p>
                    <p className="text-sm text-emerald-700 italic">"{ticket.catatan_perbaikan}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetail;
