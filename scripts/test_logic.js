
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    const { data: d } = await supabase.from('directorates').select('name').eq('id', 'd9f66b00-4782-4fc3-a064-04029529054b').single();
    const name = d.name;
    const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isSINE = normalizedName.includes('sine');
    const isCP = normalizedName.includes('profis') || normalizedName.includes('centros');
    console.log('Name:', name);
    console.log('Normalized:', normalizedName);
    console.log('isSINE:', isSINE);
    console.log('isCP:', isCP);
}
test();
