const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function createTempAdmin() {
  const email = "temp_admin_test@matrixroot.com";
  const password = "AdminPassword123!";
  
  // Clean up if it already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(u => u.email === email);
  if (existingUser) {
    console.log("Removing existing test admin...");
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  console.log("Creating new test admin...");
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Temp Test Admin' }
  });

  if (createError) {
    console.error("Create error:", createError);
    return;
  }

  const userId = userData.user.id;
  console.log("Admin auth user created! ID:", userId);

  // Wait for trigger
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update profile
  const { data: profile, error: profError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: 'Temp Test Admin',
      role: 'admin'
    })
    .eq('id', userId)
    .select();

  if (profError) {
    console.error("Profile error:", profError);
  } else {
    console.log("Profile updated successfully:", profile);
  }
}

createTempAdmin();
