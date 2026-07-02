
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubmissions() {
    const { data, error } = await supabase.from('submissions').select('*').limit(10);
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Last Submissions:');
    data.forEach(sub => {
        console.log(`Month: ${sub.month}, Year: ${sub.year}, DirID: ${sub.directorate_id}, DataKeys: ${Object.keys(sub.data).slice(0, 3)}...`);
    });
}

checkSubmissions();
