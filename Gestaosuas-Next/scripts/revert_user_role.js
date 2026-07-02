
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function revert() {
    console.log("Revertendo usuário para role: user...");
    const email = 'klismanrds90@gmail.com';

    // 1. Get User
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);
    if (!user) { console.error("User not found"); return; }

    console.log("User ID:", user.id);

    // 2. Update Role to 'user'
    const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'user' }) // Back to normal
        .eq('id', user.id);

    if (roleError) console.error("Role Error:", roleError);
    else console.log("Usuário agora é 'user' (Restrito: não pode excluir).");
}

revert();
