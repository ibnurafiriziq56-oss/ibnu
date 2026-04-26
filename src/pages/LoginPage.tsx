import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      setError('Check your email for confirmation link!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Pane - Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-white">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-primary font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold uppercase">SMK Prima Unggul</span>
        </div>
        
        <div>
          <h1 className="text-6xl font-black leading-tight mb-6">
            PINTU MASUK <br /> 
            KE MASA <br /> 
            DEPANMU.
          </h1>
          <p className="text-xl opacity-80 max-w-sm">
            Gunakan akun resmi sekolah untuk mengakses sistem ujian terpadu.
          </p>
        </div>

        <div className="text-sm opacity-50">
          © 2026 SMK Prima Unggul Portal
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-col justify-center items-center p-6 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden flex flex-col items-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-4">
              S
            </div>
            <h2 className="text-2xl font-black">Portal Ujian</h2>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-black mb-2 text-gray-900">Selamat Datang</h3>
            <p className="text-gray-500">Silakan masuk menggunakan kredensial Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Sekolah</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-primary/30 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="name@smkprimaunggul.sch.id"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-primary/30 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk <LogIn size={20} /></>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400 bg-white px-4">
                ATAU
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all border-2 border-transparent hover:border-gray-100"
            >
              Daftar Akun Baru
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Lupa kata sandi? Hubungi tim IT SMK Prima Unggul.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
