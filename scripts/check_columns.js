
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
    const { data, error } = await supabase.from('submissions').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
        return;
    }
    if (data.length > 0) {
        console.log('Columns in submissions:', Object.keys(data[0]));
    } else {
        // Try to get schema via an empty query
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'submissions' });
        if (colError) {
            // Fallback: try to insert a dummy and see keys
            console.log('No data found to check columns.');
        } else {
            console.log('Columns:', cols);
        }
    }
}

checkColumns();
