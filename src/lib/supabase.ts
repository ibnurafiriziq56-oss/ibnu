import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validasi apakah key adalah placeholder atau kosong
const isValidUrl = supabaseUrl.startsWith('https://') && !supabaseUrl.includes('placeholder');
const isValidKey = supabaseAnonKey.length > 20 && supabaseAnonKey !== 'placeholder';

export const isSupabaseConfigured = isValidUrl && isValidKey;

if (!isSupabaseConfigured) {
  console.error('Supabase Configuration Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is invalid or missing.');
}

export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-fix.supabase.co',
  isValidKey ? supabaseAnonKey : 'no-key-provided'
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
