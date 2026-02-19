
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function query(table, select = '*') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: supabaseUrl,
            path: `/rest/v1/${table}?select=${select}`,
            method: 'GET',
            headers: {
                'apikey': serviceRoleKey,
                'Authorization': 'Bearer ' + serviceRoleKey
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.end();
    });
}

async function check() {
    try {
        const profiles = await query('profiles');
        console.log('Profiles:', JSON.stringify(profiles, null, 2));

        const directorates = await query('directorates');
        console.log('Directorates:', JSON.stringify(directorates, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
