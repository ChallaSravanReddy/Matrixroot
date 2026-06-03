const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function check() {
  const { data, error } = await supabase.from('courses').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("courses columns:", Object.keys(data[0] || {}));
  }
  const { data: enrolls, error: enrollsErr } = await supabase.from('enrollments').select('*').limit(1);
  if (enrollsErr) {
    console.error(enrollsErr);
  } else {
    console.log("enrollments columns:", Object.keys(enrolls[0] || {}));
  }
  const { data: profiles, error: profilesErr } = await supabase.from('profiles').select('*').limit(1);
  if (profilesErr) {
    console.error(profilesErr);
  } else {
    console.log("profiles columns:", Object.keys(profiles[0] || {}));
  }
}
check();
