import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scixewzaysdxedpvgdwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaXhld3pheXNkeGVkcHZnZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjY4ODAsImV4cCI6MjA5NzU0Mjg4MH0.DWRfvNZdw5rmWupSYt6KiEF2iDOsmTMmrU20tTvUDlk';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
