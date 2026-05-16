import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Activity } from 'lucide-react';
import { apiFetch } from '../lib/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!data) {
        setError('Gagal menghubungkan ke server.');
      } else if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'teknisi') navigate('/teknisi');
        else navigate('/user');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold">SIPEKAL</h1>
          <p className="text-blue-100 mt-1">Sistem Informasi Pemeliharaan Alat Kesehatan</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="nama@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><LogIn size={20} /> Masuk ke Sistem</>
            )}
          </button>
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Keamanan Terjamin — SIPEKAL v2.0
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
