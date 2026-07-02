
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkTables() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const tables = ['profiles', 'directorates', 'submissions', 'settings', 'profile_directorates'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table '${table}': Missing or Error (${error.message})`);
        } else {
            console.log(`Table '${table}': Exists`);
        }
    }

    // Check buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.log(`Buckets: Error (${bucketError.message})`);
    } else {
        console.log(`Buckets: ${buckets.map(b => b.name).join(', ')}`);
    }
}

checkTables();
