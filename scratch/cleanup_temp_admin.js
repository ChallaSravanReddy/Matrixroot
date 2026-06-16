const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function cleanupTempAdmin() {
  const email = "temp_admin_test@matrixroot.com";
  
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);
  if (existingUser) {
    console.log("Removing profile...");
    const { error: profDelError } = await supabaseAdmin.from('profiles').delete().eq('id', existingUser.id);
    if (profDelError) {
      console.error("Profile delete error:", profDelError);
    }
    
    console.log("Removing test admin...");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
    if (error) {
      console.error("Delete error:", error);
    } else {
      console.log("Test admin removed successfully!");
    }
  } else {
    console.log("No test admin found.");
  }
}

cleanupTempAdmin();
