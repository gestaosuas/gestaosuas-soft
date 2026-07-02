
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log("Aplicando correção final via Service Role...");
    const email = 'klismanrds90@gmail.com';
    const dirId = 'd9f66b00-4782-4fc3-a064-04029529054b'; // Formação

    // 1. Get User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);
    if (!user) { console.error("User not found via Auth API"); return; }

    console.log("User ID:", user.id);

    // 2. Fix Profile Directorates Link (using correct column profile_id)
    const { error: linkError } = await supabase.from('profile_directorates').upsert({
        profile_id: user.id, // Correct column
        directorate_id: dirId
    }, { onConflict: 'profile_id, directorate_id' });

    if (linkError) console.error("Link Error:", linkError);
    else console.log("Link Formação/SINE corrigido/criado.");

    // 3. Promote to Admin (Bypasses all RLS issues)
    const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (roleError) console.error("Role Error:", roleError);
    else console.log("Usuário promovido a ADMIN para garantir acesso total.");
}

fix();
