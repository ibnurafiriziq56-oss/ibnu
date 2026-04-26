import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your secrets.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type Role = 'admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  nis_nip: string;
  name: string;
  role: Role;
  class_name?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  start_time?: string;
  end_time?: string;
  duration: number; // in minutes
  created_by: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export interface Question {
  id: string;
  exam_id: string;
  type: 'multiple_choice' | 'essay';
  question_text: string;
  options?: string[]; // For multiple choice
  correct_answer: string;
  points: number;
}

export interface Submission {
  id: string;
  exam_id: string;
  student_id: string;
  start_time: string;
  submit_time?: string;
  status: 'started' | 'submitted';
  score?: number;
}
