import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing connection to:", supabaseUrl);
  
  // Test 1: Fetch departments to see what's in there
  const { data: depts, error: deptsError } = await supabase.from('departments').select('*');
  if (deptsError) {
    console.error("Error fetching departments:", deptsError);
  } else {
    console.log("Departments found:", depts);
  }

  // Test 2: Try to insert a dummy profile (this might fail due to RLS, but it tells us something)
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').limit(1);
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  } else {
    console.log("Profile sample:", profile);
  }
}

test();
