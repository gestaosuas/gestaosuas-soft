
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
    console.log("Diagnosing access for klismanrds90@gmail.com...");

    const targetDirId = 'd9f66b00-4782-4fc3-a064-04029529054b';

    // 1. Get User ID from Auth (indirectly via profiles or just listing users if possible, or assumption)
    // Since we can't query auth.users directly easily with JS client usually, let's try via profiles if email is stored there or just fetch all profiles
    // Actually, profiles table usually has ID. But does it have email?
    // In this system, profiles seems to have data.

    // Attempt to find user by email in profiles.
    // Assuming profiles might mirror email or we have to guess.
    // Only reliable way with Service Role is `auth.admin.listUsers()`.

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    const user = users.find(u => u.email === 'klismanrds90@gmail.com');

    if (!user) {
        console.error("User klismanrds90@gmail.com NOT FOUND in Auth!");
        return;
    }

    console.log(`User Found: ID=${user.id} | Email=${user.email}`);

    // 2. Check Profile Role
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    console.log('Profile:', profile);

    // 3. Check Profile Directorates Link
    const { data: links, error: linkError } = await supabase
        .from('profile_directorates')
        .select('*')
        .eq('user_id', user.id);

    console.log('All Links for user:', links);

    const specificLink = links.find(l => l.directorate_id === targetDirId);
    if (specificLink) {
        console.log("✅ SUCCESS: Link to Formação/SINE exists in DB.");
    } else {
        console.log("❌ FAILURE: No link found for Formação/SINE (d9f66b00...)");
    }

}

checkUser();
