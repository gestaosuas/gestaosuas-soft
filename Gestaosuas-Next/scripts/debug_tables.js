
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function listAllTables() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // This is a common pattern to list tables in Postgres if we have RPC, 
    // but here we can't do it easily.
    // Instead, let's try to query a known table and check the error message for settings.

    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    console.log('Profiles table check:', pError ? pError.message : 'OK');

    const { data: settings, error: sError } = await supabase.from('settings').select('*').limit(1);
    console.log('Settings table check:', sError ? sError.message : 'OK');

    if (sError) {
        console.log('Exact error object:', JSON.stringify(sError, null, 2));
    }
}

listAllTables();
