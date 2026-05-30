const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: modules, error: errModules } = await supabase.from('course_modules').select('*');
  console.log("=== course_modules ===");
  console.log("Error:", errModules);
  console.log("Data count:", modules?.length);

  const { data: lessons, error: errLessons } = await supabase.from('lessons').select('*');
  console.log("=== lessons ===");
  console.log("Error:", errLessons);
  console.log("Data count:", lessons?.length);
}
check();
