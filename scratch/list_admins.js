const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function listAdmins() {
  const { data: profiles, error: profError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'admin');
    
  if (profError) {
    console.error("Profiles error:", profError);
    return;
  }
  
  console.log("Admin Profiles:", profiles);
  
  const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    console.error("Auth users error:", usersError);
    return;
  }
  
  profiles.forEach(p => {
    const u = users.users.find(user => user.id === p.id);
    if (u) {
      console.log(`Admin Name: ${p.full_name}, Email: ${u.email}`);
    } else {
      console.log(`Admin Name: ${p.full_name}, ID: ${p.id} (No auth user found)`);
    }
  });
}

listAdmins();
