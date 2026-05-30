const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data: courses, error: errC } = await supabase.from('courses').select('id, title');
  if (errC) {
    console.error("Courses fetch error:", errC);
    return;
  }
  console.log("=== Courses ===");
  console.log(courses);

  for (const c of courses) {
    console.log(`\n=== Course: ${c.title} (${c.id}) ===`);
    const { data: modules, error: errM } = await supabase.from('course_modules').select('id, title, order_index').eq('course_id', c.id);
    console.log("Modules:");
    console.log(modules);

    const { data: lessons, error: errL } = await supabase.from('lessons').select('id, title, module_id, order_index').eq('course_id', c.id);
    console.log("Lessons:");
    console.log(lessons);
  }
}
inspect();
