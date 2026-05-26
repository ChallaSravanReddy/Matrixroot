const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function check() {
  try {
    const { data: courses, error: errC } = await supabase.from('courses').select('*').limit(1);
    if (errC) console.error("Courses Error:", errC);
    else console.log("Courses columns:", Object.keys(courses[0] || {}));

    const { data: enrollments, error: errE } = await supabase.from('enrollments').select('*').limit(1);
    if (errE) console.error("Enrollments Error:", errE);
    else console.log("Enrollments columns:", Object.keys(enrollments[0] || {}));
  } catch (e) {
    console.error(e);
  }
}
check();
