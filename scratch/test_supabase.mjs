import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nlrgjocffirvqnoyoceo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scmdqb2NmZmlydnFub3lvY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTA4MjksImV4cCI6MjA5MzQ2NjgyOX0.bMm5E4U_IZHyfYlEA6MyuuxP22D6o33r1YnxPEOHLk4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing connection to:", supabaseUrl);
  
  const { data: depts, error: deptsError } = await supabase.from('departments').select('*');
  if (deptsError) {
    console.error("Error fetching departments:", deptsError);
  } else {
    console.log("Departments found:", depts);
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').limit(1);
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  } else {
    console.log("Profile sample:", profile);
  }
}

test();
