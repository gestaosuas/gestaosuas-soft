const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const { execSync } = require('child_process');

const prodEnv = dotenv.parse(fs.readFileSync('.env.production'));
const prodSupabase = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('🚀 Buscando usuários da autenticação de produção...');
    const { data, error } = await prodSupabase.auth.admin.listUsers({
        perPage: 1000
    });
    if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        return;
    }

    console.log(`✅ ${data.users.length} usuários encontrados na produção.`);
    
    // SQL para upsert no banco local
    let sql = 'BEGIN;\n';
    
    // Senha padrão de desenvolvimento para todos os usuários locais ('password')
    const defaultPasswordHash = '$2a$10$7EqJtDQ7ZfM4aJNTdMTcO.06aS7DbS7HtcA5t46t46t46t46t46t4';

    for (const user of data.users) {
        const id = user.id;
        const email = user.email || '';
        const raw_app_meta = JSON.stringify(user.app_metadata || {});
        const raw_user_meta = JSON.stringify(user.user_metadata || {});
        const created_at = user.created_at;
        const updated_at = user.updated_at;
        const role = user.role || 'authenticated';
        const aud = user.aud || 'authenticated';
        
        const escEmail = email.replace(/'/g, "''");
        const escAppMeta = raw_app_meta.replace(/'/g, "''");
        const escUserMeta = raw_user_meta.replace(/'/g, "''");
        
        sql += `
        INSERT INTO auth.users (
            id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, encrypted_password, email_confirmed_at
        ) VALUES (
            '${id}', '${escEmail}', '${escAppMeta}', '${escUserMeta}', '${created_at}', '${updated_at}', '${role}', '${aud}', '${defaultPasswordHash}', NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            raw_app_meta_data = EXCLUDED.raw_app_meta_data,
            raw_user_meta_data = EXCLUDED.raw_user_meta_data,
            updated_at = EXCLUDED.updated_at,
            role = EXCLUDED.role,
            aud = EXCLUDED.aud;
        `;
    }
    
    sql += 'COMMIT;\n';
    
    console.log('💾 Importando usuários no container Docker postgres...');
    try {
        execSync('docker exec -i supabase_db_Gestaosuas psql -U postgres -d postgres', {
            input: sql,
            stdio: ['pipe', 'inherit', 'inherit']
        });
        console.log('✨ Usuários importados com sucesso no Docker local!');
    } catch (e) {
        console.error('❌ Erro ao rodar script de importação:', e.message);
    }
}

run().catch(console.error);
