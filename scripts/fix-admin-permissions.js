const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyAndFixPermissions() {
    console.log('Checking permissions for critical users...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing keys"); return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const targetEmails = ['klismanrds@gmail.com', 'gestaosuas@uberlandia.mg.gov.br'];

    for (const email of targetEmails) {
        // 1. Get Auth User
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log(`User ${email} NOT FOUND in Auth.`);
            continue;
        }

        console.log(`User ${email} found (ID: ${user.id}). Checking Profile...`);

        // 2. Check/Update Profile Role to Admin
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (!profile) {
            console.log(`Profile missing for ${email}. Creating admin profile...`);
            await supabase.from('profiles').insert({ id: user.id, role: 'admin', full_name: 'Admin Recovered' });
        } else if (profile.role !== 'admin') {
            console.log(`User ${email} is currently '${profile.role}'. Promoting to ADMIN...`);
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
        } else {
            console.log(`User ${email} is already ADMIN.`);
        }

        // 3. Ensure Access to ALL Directorates (if logic depends on it, but Admin role usually bypasses)
        // Let's add them specifically just in case
        console.log('Ensuring access to all directorates...');
        const { data: allDirs } = await supabase.from('directorates').select('id');

        if (allDirs && allDirs.length > 0) {
            const assignments = allDirs.map(d => ({ profile_id: user.id, directorate_id: d.id }));
            const { error: assignError } = await supabase.from('profile_directorates').insert(assignments).select();
            // Ignore unique violation
        }
    }
    console.log('Permission check complete.');
}

verifyAndFixPermissions();
