import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsmjtrgffsvfbymrzsgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbWp0cmdmZnN2ZmJ5bXJ6c2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODI1MDgsImV4cCI6MjA5NDM1ODUwOH0.dZ2OvxxZIwmhrj0aBRdvkuC0Ke5EMUvFHDh--Nkpul4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
