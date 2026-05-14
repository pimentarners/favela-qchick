
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// 1. Vá em https://supabase.com/dashboard/project/_/settings/api
// 2. Copie a "Project URL" e a "anon public" key
// 3. Cole abaixo:

const supabaseUrl = 'https://ltnkqxfrtvnmsmllebkq.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmtxeGZydHZubXNtbGxlYmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTYxMjYsImV4cCI6MjA5NDI3MjEyNn0.0mgYFZLIxjoCgD7dtE3DksKt2uGE30AvrrcEefxVggA';

export const supabase = createClient(supabaseUrl, supabaseKey);
