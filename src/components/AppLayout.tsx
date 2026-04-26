import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { 
  LayoutDashboard, 
  FileText, 
  Library, 
  Users, 
  ClipboardList, 
  History, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/app', 
      icon: LayoutDashboard, 
      roles: ['admin', 'teacher', 'student'] 
    },
    { 
      label: 'Manajemen Ujian', 
      path: '/app/manage-exams', 
      icon: FileText, 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Bank Soal', 
      path: '/app/bank-soal', 
      icon: Library, 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Data Siswa & User', 
      path: '/app/users', 
      icon: Users, 
      roles: ['admin'] 
    },
    { 
      label: 'Rekap Nilai', 
      path: '/app/rekap', 
      icon: ClipboardList, 
      roles: ['admin', 'teacher'] 
    },
    { 
      label: 'Daftar Ujian', 
      path: '/app/exams', 
      icon: FileText, 
      roles: ['student'] 
    },
    { 
      label: 'Riwayat Ujian', 
      path: '/app/history', 
      icon: History, 
      roles: ['student'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">SMK PRIMA</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Unggul Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-primary-light text-primary font-semibold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={location.pathname === item.path ? "text-primary" : "text-slate-400"} />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Support</div>
          <div className="flex items-center gap-3 px-4 py-2 text-slate-500 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Server Status: OK</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2 mt-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Back-drop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  P
                </div>
                <h1 className="text-sm font-bold">SMK PRIMA</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-4 space-y-2 pt-4">
              {filteredMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-xl",
                    location.pathname === item.path 
                      ? "bg-primary-light text-primary" 
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <item.icon size={22} />
                  <span className="font-semibold text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t font-medium">
              <button onClick={handleSignOut} className="flex items-center gap-4 text-red-500 w-full py-2">
                <LogOut size={22} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden text-slate-800">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
              <span className="hover:text-slate-600 transition-colors">App</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold uppercase tracking-tight text-xs">
                {filteredMenu.find(m => m.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">{profile?.name}</div>
                <div className="text-[10px] text-primary font-semibold uppercase">{profile?.role}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <UserIcon size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
