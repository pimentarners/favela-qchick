
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// 1. Vá em https://supabase.com/dashboard/project/_/settings/api
// 2. Copie a "Project URL" e a "anon public" key
// 3. Cole abaixo:

const supabaseUrl = 'https://xgplyhtzfdkvpnqkeazi.supabase.co'; // Ex: https://abcdefghijklm.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncGx5aHR6ZmRrdnBucWtlYXppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI3Nzg4NSwiZXhwIjoyMDg0ODUzODg1fQ.LE2-1Ir6XI_K2Bz2ELnZtS6_Qs14-BuIzjmfHbMP228'; // Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

export const supabase = createClient(supabaseUrl, supabaseKey);
