
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTodaySubmissions() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .gte('created_at', today);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} submissions created today...`);
    data.forEach(sub => {
        const keys = Object.keys(sub.data);
        console.log(`ID: ${sub.id}, Month: ${sub.month}, Year: ${sub.year}, DirID: ${sub.directorate_id}`);
        console.log(`- Data: ${keys.slice(0, 5).join(', ')}...`);
        console.log('---');
    });
}

checkTodaySubmissions();
