import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import ManageExams from './pages/admin/ManageExams';
import ExamEditor from './pages/admin/ExamEditor';
import QuestionBank from './pages/admin/QuestionBank';
import UserManagement from './pages/admin/UserManagement';
import ExamRecap from './pages/admin/ExamRecap';
import StudentExams from './pages/student/StudentExams';
import TakeExam from './pages/student/TakeExam';
import ResultHistory from './pages/student/ResultHistory';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return <Navigate to="/app" replace />;

  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
        {/* Admin & Guru Routes */}
        <Route path="manage-exams" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><ManageExams /></ProtectedRoute>} />
        <Route path="manage-exams/:examId/edit" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><ExamEditor /></ProtectedRoute>} />
        <Route path="bank-soal" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><QuestionBank /></ProtectedRoute>} />
        <Route path="rekap" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><ExamRecap /></ProtectedRoute>} />
        
        {/* Admin only */}
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
        
        {/* Student Routes */}
        <Route path="exams" element={<ProtectedRoute allowedRoles={['student']}><StudentExams /></ProtectedRoute>} />
        <Route path="history" element={<ProtectedRoute allowedRoles={['student']}><ResultHistory /></ProtectedRoute>} />
      </Route>

      {/* Exam session is specialized, maybe outside AppLayout for full-screen feel */}
      <Route path="/app/exams/:examId/start" element={
        <ProtectedRoute allowedRoles={['student']}>
          <TakeExam />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
