import React, { useState, useEffect } from 'react';
import { supabase, Exam } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { Clock, Play, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function StudentExams() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExams(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black">Daftar Ujian</h3>
          <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest mt-1">Ujian yang tersedia untuk dikerjakan</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-dashed text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-medium">Belum ada ujian aktif yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {exams.map((exam, idx) => (
            <motion.div 
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Aktif
                </div>
              </div>

              <h4 className="text-2xl font-black text-gray-900 mb-2">{exam.title}</h4>
              <p className="text-gray-400 text-sm line-clamp-2 mb-8">{exam.description || 'Instruksi pengerjaan tidak tersedia.'}</p>

              <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-50">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm font-bold">{exam.duration} Menit</span>
                </div>
              </div>

              <Link 
                to={`/app/exams/${exam.id}/start`}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group-hover:scale-[1.02] active:scale-95 transition-all"
              >
                MULAI UJIAN <Play size={18} fill="currentColor" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
