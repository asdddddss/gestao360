import { createClient } from '@supabase/supabase-js';

// As credenciais do Supabase foram configuradas com a URL e a Chave Anônima fornecidas.
const supabaseUrl = 'https://nugjdshdplaqklbhhkpt.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51Z2pkc2hkcGxhcWtsYmhoa3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDEyMjUsImV4cCI6MjA3NjE3NzIyNX0.GycuANmjZWBTWYHjA2LvtG_5p_R3tQmq9D1iaPqhrII';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'As credenciais do Supabase (URL e Chave Anônima) não foram configuradas.';
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 2rem; text-align: center; color: white; background-color: #372d2d; border: 2px solid #D4AF37; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif;"><h1>${errorMessage}</h1></div>`;
  }
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);