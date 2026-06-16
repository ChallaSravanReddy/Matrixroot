const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function testAuthAndEnroll() {
  const testEmail = `offline_test_${Date.now()}@matrixroot.com`;
  console.log("Creating auth user with email:", testEmail);
  
  // 1. Create auth user
  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: crypto.randomBytes(16).toString('hex'),
    email_confirm: true,
    user_metadata: { full_name: 'Offline Test Student' }
  });
  
  if (userErr) {
    console.error("Auth User Creation Error:", userErr);
    return;
  }
  
  const studentId = userData.user.id;
  console.log("Auth User Created! ID:", studentId);
  
  try {
    // 2. Wait 1 second to see if trigger creates profile, or check if it exists
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let { data: profile, error: profFetchErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();
      
    if (profFetchErr) {
      console.error("Profile Fetch Error:", profFetchErr);
    }
    
    if (!profile) {
      console.log("No profile auto-created. Inserting profile manually...");
      const { data: newProf, error: profInsertErr } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: studentId,
            full_name: 'Offline Test Student',
            role: 'student'
          }
        ])
        .select()
        .single();
        
      if (profInsertErr) {
        console.error("Profile Insert Error:", profInsertErr);
        return;
      }
      profile = newProf;
    } else {
      console.log("Profile was auto-created by trigger! Updating full_name...");
      const { data: updatedProf, error: profUpdateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: 'Offline Test Student',
          role: 'student'
        })
        .eq('id', studentId)
        .select()
        .single();
        
      if (profUpdateErr) {
        console.error("Profile Update Error:", profUpdateErr);
        return;
      }
      profile = updatedProf;
    }
    
    console.log("Profile is ready:", profile);
    
    // 3. Get a course
    const { data: courses } = await supabaseAdmin.from('courses').select('id').limit(1);
    if (courses && courses.length > 0) {
      const courseId = courses[0].id;
      console.log("Using Course ID:", courseId);
      
      console.log("Testing insert into enrollments...");
      const { data: enrollData, error: enrollErr } = await supabaseAdmin
        .from('enrollments')
        .insert([
          {
            student_id: studentId,
            course_id: courseId,
            payment_status: 'completed',
            is_certified: true,
            certification_status: 'approved',
            final_score: 95
          }
        ])
        .select();
        
      if (enrollErr) {
        console.error("Enrollment Insert Error:", enrollErr);
      } else {
        console.log("Enrollment Insert Success:", enrollData);
        
        // Cleanup test data
        console.log("Cleaning up enrollment...");
        await supabaseAdmin.from('enrollments').delete().eq('student_id', studentId);
      }
    }
    
  } catch (err) {
    console.error("Exception occurred:", err);
  } finally {
    // Cleanup auth user (which should delete profile due to cascade, or we do it manually)
    console.log("Cleaning up auth user...");
    await supabaseAdmin.auth.admin.deleteUser(studentId);
    console.log("Cleanup complete!");
  }
}

testAuthAndEnroll();
