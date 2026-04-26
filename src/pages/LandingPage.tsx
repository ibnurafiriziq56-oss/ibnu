import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, Cpu, Palette, Calculator, ShoppingBag, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';

const majors = [
  { id: 'tkj', name: 'TKJ', full: 'Teknik Komputer dan Jaringan', icon: Cpu, color: 'bg-blue-500' },
  { id: 'dkv', name: 'DKV', full: 'Desain Komunikasi Visual', icon: Palette, color: 'bg-purple-500' },
  { id: 'ak', name: 'AK', full: 'Akuntansi', icon: Calculator, color: 'bg-green-500' },
  { id: 'bc', name: 'BC', full: 'Bisnis Digital', icon: ShoppingBag, color: 'bg-orange-500' },
  { id: 'mplb', name: 'MPLB', full: 'Manajemen Perkantoran', icon: Briefcase, color: 'bg-teal-500' },
  { id: 'bd', name: 'BD', full: 'Bisnis Daring', icon: TrendingUp, color: 'bg-pink-500' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl shadow-lg">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight">SMK PRIMA UNGGUL</span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary-dark transition-all transform hover:scale-105 shadow-md">
            Login Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-7xl font-black leading-[0.9] tracking-tight mb-8">
              MASA DEPAN <br />
              <span className="text-primary italic">TERENCANA</span> <br />
              DI SINI.
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-md leading-relaxed">
              Membangun kompetensi, karakter, dan mentalitas profesional kelas dunia. Selamat datang di portal ujian resmi SMK Prima Unggul.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-2">
                Masuk Ujian <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl" />
            <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-white">
              <img 
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80" 
                alt="Students" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {/* Stats floating */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hidden lg:block">
              <span className="text-4xl font-black text-primary">100%</span>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Lulusan Kompeten</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Majors Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Jurusan Kami</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Tersedia beragam pilihan kompetensi keahlian yang relevan dengan kebutuhan industri masa kini.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {majors.map((major, idx) => (
            <motion.div
              key={major.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[32px] border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all cursor-default"
            >
              <div className={`w-14 h-14 ${major.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <major.icon size={28} />
              </div>
              <h3 className="text-3xl font-black mb-2">{major.name}</h3>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{major.full}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6 text-white text-center">
        <div className="max-w-7xl mx-auto">
          <p className="font-bold opacity-60">© 2026 SMK Prima Unggul. Built for Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
