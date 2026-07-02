
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectMoved() {
    const { data, error } = await supabase.from('submissions').select('*').eq('id', 'be9e7d34-2f96-424e-8138-b28ce42f3913').single();
    if (error) { console.error(error); return; }

    console.log('Submission ID:', data.id);
    console.log('Directorate ID:', data.directorate_id);
    console.log('Month/Year:', data.month, data.year);
    console.log('Keys:', Object.keys(data.data));
}

inspectMoved();
