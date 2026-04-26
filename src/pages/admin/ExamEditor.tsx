import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Exam, Question } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search,
  BookOpen,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamEditor() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      // Fetch Exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();
      
      if (examError) throw examError;
      setExam(examData);

      // Fetch Questions for this exam
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: true });
      
      if (qError) throw qError;
      setQuestions(qData || []);
    } catch (err: any) {
      console.error(err);
      navigate('/app/manage-exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .is('exam_id', null); // Generic bank questions have no exam_id
    
    if (!error) setBankQuestions(data || []);
  };

  const addFromBank = async (bankQ: any) => {
    try {
      const { id, created_at, ...rest } = bankQ;
      const { error } = await supabase
        .from('questions')
        .insert([{
          ...rest,
          exam_id: examId
        }]);
      
      if (error) throw error;
      fetchExamData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const removeQuestion = async (id: string) => {
    if (!window.confirm('Hapus soal ini dari ujian?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      fetchExamData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Question>>({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('questions')
        .insert([{ ...formData, exam_id: examId }]);
      if (error) throw error;
      
      setIsModalOpen(false);
      resetForm();
      fetchExamData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 5
    });
  };

  if (loading) return (
    <div className="py-20 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/app/manage-exams')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft />
        </button>
        <div>
          <h3 className="text-2xl font-black">{exam?.title}</h3>
          <p className="text-gray-400 font-semibold text-xs tracking-widest uppercase">Editor Soal Ujian</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-lg font-black flex items-center gap-2">
            <BookOpen className="text-primary" size={20} />
            Daftar Soal ({questions.length})
          </h4>
          <div className="flex gap-2">
            <button 
              onClick={() => { fetchBankQuestions(); setIsBankModalOpen(true); }}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Impor dari Bank
            </button>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} /> Buat Soal Baru
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-50 rounded-[24px]">
              <p className="text-gray-400 font-medium lowercase">Belum ada soal ditambahkan ke ujian ini</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="p-5 bg-gray-50 rounded-[24px] border border-transparent hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{q.type}</span>
                    </div>
                    <p className="font-bold text-gray-800 leading-relaxed">{q.question_text}</p>
                    {q.options && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`text-xs p-2 rounded-lg border ${opt === q.correct_answer ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-gray-100 text-gray-500'}`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Bank Soal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBankModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-8 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black tracking-tight">Pilih dari Bank Soal</h4>
                <button onClick={() => setIsBankModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Cari di bank soal..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                {bankQuestions.filter(q => q.question_text.toLowerCase().includes(searchTerm.toLowerCase())).map((q) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/20 transition-all flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{q.category || 'Produktif'}</span>
                      <p className="text-sm font-bold text-gray-700 line-clamp-2">{q.question_text}</p>
                    </div>
                    <button 
                      onClick={() => addFromBank(q)}
                      className="px-4 py-2 bg-white hover:bg-primary hover:text-white rounded-xl text-xs font-black transition-all border border-gray-100 hover:border-primary"
                    >
                      TAMBAH
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Buat Soal Baru */}
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
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black tracking-tight text-primary">Tambah Soal Baru</h4>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Poin Soal</label>
                  <input 
                    type="number"
                    value={formData.points}
                    onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 5})}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Teks Pertanyaan</label>
                  <textarea 
                    required
                    value={formData.question_text}
                    onChange={e => setFormData({...formData, question_text: e.target.value})}
                    rows={3}
                    placeholder="Contoh: Apa kepanjangan dari OSI?"
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Opsi Jawaban & Jawaban Benar</label>
                  {formData.options?.map((opt, i) => (
                    <div key={i} className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, correct_answer: opt})}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${
                          formData.correct_answer === opt && opt !== ''
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                      <input 
                        required
                        type="text" 
                        value={opt}
                        onChange={e => {
                          const newOpts = [...(formData.options || [])];
                          newOpts[i] = e.target.value;
                          setFormData({...formData, options: newOpts});
                        }}
                        placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                      />
                    </div>
                  ))}
                  <p className="text-[10px] font-bold text-gray-400 italic ml-1">Klik huruf (A/B/C/D) untuk menandai sebagai jawaban benar.</p>
                </div>

                <div className="pt-4">
                  <button className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
                    SIMPAN SOAL KE UJIAN
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
