const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if(key) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }
  
  const user = usersData.users.find(u => u.email === 'alhafidz.almagribi409@gmail.com');
  if (!user) {
    console.error("User not found!");
    return;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return;
  }

  const metadata = { ...user.user_metadata, role: 'super_admin' };
  const { error: metaError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: metadata
  });

  if (metaError) {
    console.error("Error updating metadata:", metaError);
    return;
  }

  console.log("Successfully updated role to super_admin for", user.email);
}

run();
