import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Search, 
  Download, 
  Trophy,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultRecap {
  id: string;
  score: number;
  completed_at: string;
  profiles: {
    name: string;
    nis_nip: string;
  };
  exams: {
    title: string;
  };
}

export default function ExamRecap() {
  const [recaps, setRecaps] = useState<ResultRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecaps();
  }, []);

  const fetchRecaps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          score,
          completed_at,
          profiles:student_id (name, nis_nip),
          exams:exam_id (title)
        `)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      setRecaps(data as unknown as ResultRecap[] || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecaps = recaps.filter(r => 
    r.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.profiles?.nis_nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.exams?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black">Rekap Nilai</h3>
          <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest mt-1">Laporan hasil ujian seluruh siswa</p>
        </div>
        <button className="bg-white text-gray-600 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-gray-100 hover:shadow-md transition-all w-fit">
          <Download size={18} /> Export Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partisipan</p>
              <h4 className="text-2xl font-black">{recaps.length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rata-rata</p>
              <h4 className="text-2xl font-black">
                {recaps.length ? (recaps.reduce((acc, r) => acc + r.score, 0) / recaps.length).toFixed(1) : '0'}
              </h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tertinggi</p>
              <h4 className="text-2xl font-black">
                {recaps.length ? Math.max(...recaps.map(r => r.score)) : '0'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h4 className="text-lg font-black pr-4 shrink-0">Daftar Hasil</h4>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Cari siswa atau ujian..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Siswa</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Ujian</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Selesai</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium">Memuat data...</td>
                </tr>
              ) : filteredRecaps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium tabular-nums lowercase">Belum ada pengerjaan</td>
                </tr>
              ) : filteredRecaps.map((recap, idx) => (
                <tr key={recap.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 uppercase">
                        {recap.profiles?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{recap.profiles?.name}</div>
                        <div className="text-[10px] font-black text-gray-400 font-mono tracking-tighter">{recap.profiles?.nis_nip}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-600">
                    {recap.exams?.title}
                  </td>
                  <td className="px-8 py-6 text-gray-400 font-medium tabular-nums text-xs">
                    {new Date(recap.completed_at).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-2xl font-black border-2 ${
                      recap.score >= 80 ? 'text-green-500 bg-green-50 border-green-100' :
                      recap.score >= 60 ? 'text-orange-500 bg-orange-50 border-orange-100' :
                      'text-red-500 bg-red-50 border-red-100'
                    }`}>
                      {Math.round(recap.score)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
