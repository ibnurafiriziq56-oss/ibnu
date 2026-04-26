import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  Trophy, 
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState<any>({
    activeExams: 0,
    totalStudents: 0,
    totalSubmissions: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    setStats({
      activeExams: 5,
      totalStudents: 1248,
      totalSubmissions: 1200,
      averageScore: 84.5
    });
  };

  const renderAdminStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Siswa', value: '1,248', trend: '+12%', color: 'text-slate-800' },
        { label: 'Guru Aktif', value: '42', trend: 'PTK', color: 'text-slate-800' },
        { label: 'Ujian Berjalan', value: '04', trend: 'LIVE', color: 'text-primary', border: 'border-l-4 border-primary' },
        { label: 'Total Soal', value: '2,150', trend: 'Items', color: 'text-slate-800' },
      ].map((stat, i) => (
        <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between ${stat.border || ''}`}>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{stat.label}</div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800">{stat.value}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend === 'LIVE' ? 'bg-red-50 text-primary animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>{stat.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-10">
      <div className="bg-primary p-8 rounded-[32px] text-white overflow-hidden relative shadow-lg shadow-red-200">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2 tracking-tight">Halo, {profile?.name}! 👋</h3>
          <p className="opacity-90 font-medium max-w-sm text-sm">
            Tersedia 3 ujian baru hari ini. Pastikan koneksi internet Anda stabil sebelum memulai.
          </p>
          <Link to="/app/exams" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-2xl mt-6 hover:shadow-xl transition-all hover:scale-105 active:scale-95">
            Lihat Daftar Ujian <ChevronRight size={20} />
          </Link>
        </div>
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-10 transform scale-150 pointer-events-none">
          <Trophy size={180} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <h4 className="text-xl font-black mb-6 tracking-tight">Jadwal Minggu Ini</h4>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 hover:bg-slate-100 transition-colors cursor-default">
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary font-bold shadow-sm">
                  {i === 1 ? 'MTK' : 'IND'}
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-slate-800">{i === 1 ? 'Matematika Dasar' : 'Bahasa Indonesia'}</h5>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Senin, 08:30 WIB
                  </p>
                </div>
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">Terjadwal</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
            <Trophy size={32} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nilai Terakhir</p>
          <h4 className="text-5xl font-black text-slate-800 mb-1">88</h4>
          <p className="text-sm font-bold text-slate-500">Produktif TKJ</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl">
      {(profile?.role === 'admin' || profile?.role === 'teacher') && (
        <>
          {renderAdminStats()}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">Jadwal Ujian Terbaru</h2>
                <Link to="/app/manage-exams" className="text-primary text-xs font-bold hover:underline">Lihat Semua</Link>
              </div>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                 <div className="text-center p-8">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                     <Clock size={32} />
                   </div>
                   <p className="text-slate-400 font-medium text-sm">Belum ada jadwal yang berjalan saat ini.</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-red-100">
                <h3 className="font-bold text-lg leading-tight mb-2">Aksi Cepat Admin</h3>
                <p className="text-red-100 text-xs mb-6">Kelola sistem SMK Prima Unggul dalam satu klik.</p>
                <div className="space-y-2">
                  <Link to="/app/manage-exams" className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all text-left px-4 flex items-center justify-between group">
                    <span>Manajemen Ujian</span>
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  </Link>
                  <Link to="/app/bank-soal" className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all text-left px-4 flex items-center justify-between group">
                    <span>Bank Soal</span>
                    <FileText size={16} className="group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link to="/app/users" className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all text-left px-4 flex items-center justify-between group">
                    <span>Manajemen User</span>
                    <Users size={16} className="group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Status Jurusan</h3>
                <div className="space-y-4">
                  {[
                    { label: 'TKJ', val: 85 },
                    { label: 'DKV', val: 70 },
                    { label: 'AK', val: 92 }
                  ].map(j => (
                    <div key={j.label} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{j.label}</span>
                      <div className="flex-1 mx-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${j.val}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{j.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {profile?.role === 'student' && renderStudentDashboard()}

      {!profile?.role && !loading && (
        <div className="bg-white p-12 rounded-[32px] border border-dashed text-center">
          <p className="text-gray-400 font-medium">Profil Anda belum lengkap atau tabel database belum siap.</p>
          <p className="text-xs text-gray-400 mt-2">Pastikan SQL Schema sudah dijalankan di Supabase.</p>
        </div>
      )}
    </div>
  );
}
