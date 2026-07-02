
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function tryInsert() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Trying to insert into settings...');
    const { data, error } = await supabase.from('settings').upsert({ key: 'test', value: 'value' });

    if (error) {
        console.error('Insert error:', error);
    } else {
        console.log('Insert success:', data);
    }
}

tryInsert();
