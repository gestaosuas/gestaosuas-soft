
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
    const { data, error } = await supabase.from('profile_directorates').select('*').limit(1);
    if (error) console.log(error);
    else console.log("Columns:", data.length > 0 ? Object.keys(data[0]) : "Table empty or no permission (but service role should see)");
}
inspect();
