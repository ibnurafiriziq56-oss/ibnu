import React, { useState, useEffect } from 'react';
import { supabase, Exam } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function ManageExams() {
  const { profile } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    title: '',
    description: '',
    duration: 60,
    status: 'active'
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExams(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('exams')
        .insert([{
          ...newExam,
          created_by: profile.id
        }]);

      if (error) throw error;
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus ujian ini?')) return;
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      fetchExams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black">Manajemen Ujian</h3>
          <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest mt-1">Buat dan atur jadwal ujian siswa</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} /> Buat Ujian
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-[32px] border border-dashed text-center">
            <p className="text-gray-400 font-medium">Belum ada ujian yang dibuat.</p>
          </div>
        ) : exams.map((exam) => (
          <motion.div 
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => handleDelete(exam.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                exam.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {exam.status === 'active' ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>
            
            <h4 className="text-xl font-black text-gray-900 mb-2 truncate pr-4">{exam.title}</h4>
            <p className="text-sm text-gray-400 line-clamp-2 mb-6">{exam.description || 'Tidak ada deskripsi.'}</p>

            <div className="space-y-3 pt-4 border-t border-gray-50 text-xs">
              <div className="flex items-center gap-3 font-bold text-gray-600">
                <Clock size={16} className="text-primary" />
                <span>Durasi: {exam.duration} Menit</span>
              </div>
              {exam.created_at && (
                <div className="flex items-center gap-3 font-bold text-gray-400 font-mono text-[10px]">
                  <span>DIBUAT: {new Date(exam.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <Link 
              to={`/app/manage-exams/${exam.id}/edit`}
              className="mt-6 w-full py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Edit2 size={16} /> Edit Soal & Detail
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Modal Buat Ujian */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.form 
              onSubmit={handleCreateExam}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black tracking-tight">Buat Ujian Baru</h4>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Judul Ujian</label>
                  <input 
                    required
                    type="text" 
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    placeholder="Ujian Akhir Semester Produktif TKJ"
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Deskripsi</label>
                  <textarea 
                    value={newExam.description}
                    onChange={e => setNewExam({...newExam, description: e.target.value})}
                    rows={3}
                    placeholder="Masukkan instruksi pengerjaan..."
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status Ujian</label>
                  <select 
                    value={newExam.status}
                    onChange={e => setNewExam({...newExam, status: e.target.value as any})}
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                  >
                    <option value="active">Aktif (Tersedia untuk Siswa)</option>
                    <option value="inactive">Non-Aktif (Arsip)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Durasi Pengerjaan (Menit)</label>
                  <input 
                    required
                    type="number" 
                    value={newExam.duration}
                    onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value)})}
                    placeholder="Contoh: 60"
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                    SIMPAN & LANJUTKAN
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
