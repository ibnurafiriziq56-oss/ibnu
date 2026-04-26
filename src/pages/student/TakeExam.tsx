import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Question, Exam } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TakeExam() {
  const { examId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();
      
      if (examError) throw examError;
      setExam(examData);
      setTimeLeft(examData.duration * 60);

      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: true });
      
      if (qError) throw qError;
      setQuestions(qData || []);
    } catch (err: any) {
      console.error(err);
      navigate('/app/exams');
    } finally {
      setLoading(false);
    }
  };

  const submitExam = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correct++;
        }
      });

      const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;

      const { error } = await supabase
        .from('exam_results')
        .insert([{
          exam_id: examId,
          student_id: profile?.id,
          score,
          answers,
          completed_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      alert(`Ujian selesai! Skor Anda: ${score.toFixed(1)}`);
      navigate('/app/history');
    } catch (err: any) {
      alert("Gagal mengirim jawaban: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, profile, answers, questions, isSubmitting, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitExam]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-b-transparent mx-auto mb-4"></div>
        <p className="font-black text-xs uppercase tracking-widest text-gray-400">Menyiapkan Lembar Jawaban...</p>
      </div>
    </div>
  );

  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-orange-50 text-orange-400 rounded-[32px] flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2">Ujian Belum Siap</h3>
          <p className="text-gray-400 font-medium mb-8 leading-relaxed">
            Maaf, ujian <span className="text-gray-900">"{exam?.title}"</span> belum memiliki soal. Silakan hubungi pengajar Anda untuk informasi lebih lanjut.
          </p>
          <button 
            onClick={() => navigate('/app/exams')} 
            className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            KEMBALI KE DAFTAR UJIAN
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
              {currentIdx + 1}
            </div>
            <div>
              <h1 className="font-black text-lg line-clamp-1">{exam?.title}</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soal {currentIdx + 1} dari {questions.length}</p>
            </div>
          </div>
          
          <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 font-mono font-black ${
            (timeLeft || 0) < 300 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 text-gray-700'
          }`}>
            <Clock size={20} />
            <span>{formatTime(timeLeft || 0)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100"
            >
              <div className="mb-8">
                <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                  {currentQ?.points} Poin
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                  {currentQ?.question_text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQ?.options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({...answers, [currentQ.id]: opt})}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                      answers[currentQ.id] === opt 
                        ? 'bg-primary/5 border-primary text-primary font-bold shadow-md' 
                        : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-colors ${
                      answers[currentQ.id] === opt 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 group-hover:bg-gray-200 text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev -1)}
              className="flex items-center gap-2 px-6 py-3 font-bold text-gray-400 disabled:opacity-30 hover:text-gray-600 transition-all font-black uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={16} /> KEMBALI
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="bg-green-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
              >
                SUBMIT UJIAN <Send size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
              >
                BERIKUTNYA <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm sticky top-24">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <HelpCircle size={14} /> Navigasi Soal
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                    currentIdx === idx 
                      ? 'bg-primary text-white shadow-lg ring-4 ring-primary/10' 
                      : answers[q.id] 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">
                <CheckCircle2 size={12} /> Progres
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-700 font-mono">
                <span>{Object.keys(answers).length}</span>
                <span className="text-gray-300">/</span>
                <span>{questions.length}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${(Object.keys(answers).length / (questions.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[40px] p-10 text-center"
            >
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2">Selesai Ujian?</h3>
              <p className="text-gray-400 font-medium mb-8">Pastikan semua jawaban sudah terisi dengan benar sebelum mengirim.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="py-4 rounded-2xl font-black bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all text-xs tracking-widest"
                >
                  CEK LAGI
                </button>
                <button 
                  onClick={submitExam}
                  className="py-4 rounded-2xl font-black bg-green-500 text-white shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase"
                >
                  YA, SELESAI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
