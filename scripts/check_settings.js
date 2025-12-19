
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkSettings() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Fetching from settings...');
    const { data, error } = await supabase.from('settings').select('*');

    if (error) {
        console.error('Error fetching settings:', error);

        // Try to create it if it really doesn't exist
        if (error.message.includes('not find')) {
            console.log('Attempting to create settings table...');
            // We can't easily run arbitrary SQL via the client unless we have a function,
            // but we can try to insert and see if it fails differently.
        }
        return;
    }

    console.log('Settings Rows:', data);

    const settings = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {})

    console.log('Processed Settings:', settings);
}

checkSettings();
