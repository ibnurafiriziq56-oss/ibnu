import React, { useState, useEffect } from 'react';
import { supabase, Question } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Layers,
  ChevronRight,
  X,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BankQuestion extends Omit<Question, 'exam_id'> {
  category?: string;
}

export default function QuestionBank() {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<BankQuestion>>({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 5,
    category: 'Produktif'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message.includes('category')) {
          console.warn("Kolom 'category' belum ada di database. Silakan jalankan SQL FIX.");
        } else {
          throw error;
        }
      }
      setQuestions(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a payload without category if it causes issues, or handle error
      const payload = { ...formData };
      
      if (editingId) {
        const { error } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([payload]);
        if (error) {
          if (error.message.includes('category')) {
            throw new Error("Gagal menyimpan: Kolom 'category' belum ada di database Supabase. Silakan jalankan perintah SQL yang saya berikan di chat.");
          }
          throw error;
        }
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (q: BankQuestion) => {
    setFormData(q);
    setEditingId(q.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus soal ini dari bank soal?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      fetchQuestions();
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
      points: 5,
      category: 'Produktif'
    });
  };

  const categories = ['Semua', ...Array.from(new Set(questions.map(q => q.category).filter(Boolean)))];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black">Bank Soal</h3>
          <p className="text-gray-400 font-semibold uppercase text-xs tracking-widest mt-1">Kelola koleksi soal ujian Anda</p>
        </div>
        <button 
          onClick={() => { resetForm(); setEditingId(null); setIsModalOpen(true); }}
          className="bg-primary text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all w-fit"
        >
          <Plus size={20} /> Tambah Soal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari soal..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat as string}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] border border-dashed text-center">
            <p className="text-gray-400 font-medium">Tidak ada soal yang ditemukan.</p>
          </div>
        ) : filteredQuestions.map((q, idx) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {q.category || 'Umum'}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {q.points} Poin
                  </span>
                </div>
                <p className="text-gray-800 font-bold text-lg leading-relaxed">{q.question_text}</p>
                
                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border ${
                          opt === q.correct_answer 
                            ? 'bg-green-50 border-green-200 text-green-700 font-bold' 
                            : 'bg-gray-50 border-transparent text-gray-600'
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-inherit text-[10px] font-black">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(q)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal CRUD Soal */}
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
                <h4 className="text-2xl font-black tracking-tight">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h4>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Kategori</label>
                    <input 
                      required
                      type="text" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="Contoh: Produktif"
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Poin</label>
                    <input 
                      required
                      type="number" 
                      value={formData.points}
                      onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Teks Pertanyaan</label>
                  <textarea 
                    required
                    value={formData.question_text}
                    onChange={e => setFormData({...formData, question_text: e.target.value})}
                    rows={3}
                    placeholder="Apa perintah untuk mengecek koneksi jaringan?"
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Opsi Jawaban (Pilihan Ganda)</label>
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
                  <button className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                    {editingId ? 'PERBARUI SOAL' : 'SIMPAN KE BANK SOAL'}
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
