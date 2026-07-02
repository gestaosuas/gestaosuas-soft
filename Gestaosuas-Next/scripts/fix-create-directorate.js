
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const directorateName = 'Proteção Especial à Criança e Adolescente';

const data = JSON.stringify({
    name: directorateName,
    sheet_config: {},
    form_definition: { sections: [] }
});

const options = {
    hostname: supabaseUrl,
    path: '/rest/v1/directorates',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': 'Bearer ' + serviceRoleKey,
        'Prefer': 'return=representation'
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseBody);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
