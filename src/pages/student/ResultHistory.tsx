import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { 
  Trophy, 
  Calendar, 
  ChevronRight, 
  CheckCircle2,
  FileText,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ExamResult {
  id: string;
  score: number;
  completed_at: string;
  exams: {
    title: string;
    duration: number;
  };
}

export default function ResultHistory() {
  const { profile } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchResults();
  }, [profile]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select(`
          id,
          score,
          completed_at,
          exams (
            title,
            duration
          )
        `)
        .eq('student_id', profile?.id)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      setResults(data as unknown as ExamResult[] || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-50 border-green-100';
    if (score >= 60) return 'text-orange-500 bg-orange-50 border-orange-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Riwayat Ujian</h3>
          <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest mt-1">Pantau pencapaian belajar Anda</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-dashed text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Trophy size={32} />
          </div>
          <p className="text-gray-400 font-medium">Belum ada riwayat ujian. Ayo mulai kerjakan ujian pertama Anda!</p>
          <Link 
            to="/app/exams" 
            className="inline-flex items-center gap-2 text-primary font-bold mt-4 hover:underline"
          >
            Selesaikan Ujian Sekarang <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((res, idx) => (
            <motion.div 
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${getScoreColor(res.score)}`}>
                  <span className="text-xl font-black">{Math.round(res.score)}</span>
                  <span className="text-[8px] font-black uppercase tracking-tight">Skor</span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-1">{res.exams.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      {new Date(res.completed_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      {res.exams.duration} mnt
                    </span>
                    <span className="flex items-center gap-1.5 text-green-500">
                      <CheckCircle2 size={14} />
                      Selesai
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  LIHAT DETAIL
                </button>
                <div className="p-3 bg-primary/5 text-primary rounded-xl">
                  <FileText size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
