
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env.local')));

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

// I need the CP_FORM_DEFINITION. I will just hardcode it simplified or fetch it from a test.
// Actually, I'll just use the IDs I know.

const SINE_ID = 'd9f66b00-4782-4fc3-a064-04029529054b';
const SPREADSHEET_ID = '1XfB7_m05p6_I-yEn9MpxuU765rO94S-vM2V8L09M1vA'; // From previous logic

const CP_FORM_DEFINITION = {
    sections: [
        {
            title: "RESUMO CP E SINE",
            fields: [
                { id: "resumo_vagas", label: "Vagas oferecidas", type: "number" },
                { id: "resumo_cursos", label: "Cursos", type: "number" },
                { id: "resumo_turmas", label: "Turmas", type: "number" },
                { id: "resumo_concluintes", label: "Concluintes", type: "number" },
                { id: "resumo_mulheres", label: "Mulheres", type: "number" },
                { id: "resumo_homens", label: "Homens", type: "number" },
                { id: "resumo_mercado_fem", label: "inseridos no mercado de trabalho (feminino)", type: "number" },
                { id: "resumo_mercado_masc", label: "inseridos no mercado de trabalho (masculino)", type: "number" },
            ]
        },
        // ... (I'll add more later if needed, but for now this identifies it)
    ]
};

async function transform() {
    // 1. Create CP
    const { data: cpDir, error: cpErr } = await supabase.from('directorates').insert({
        name: 'Centro Profissionalizante',
        sheet_config: { spreadsheetId: SPREADSHEET_ID, sheetName: 'CENTRO PROFISSIONALIZANTE' },
        form_definition: CP_FORM_DEFINITION // Partial for now, I'll update via UI or better script later
    }).select().single();

    if (cpErr) { console.error('CP Create Error:', cpErr); return; }
    console.log('Created CP Directorate:', cpDir.id);

    // 2. Rename SINE
    await supabase.from('directorates').update({ name: 'SINE' }).eq('id', SINE_ID);
    console.log('Renamed SINE');

    // 3. Move CP data
    const { error: moveErr } = await supabase.from('submissions')
        .update({ directorate_id: cpDir.id })
        .match({ directorate_id: SINE_ID, month: 12, year: 2025 }); // The one I just restored

    if (moveErr) console.log('Data Move Error:', moveErr);
    else console.log('Data Moved to CP');

    // 4. Link Users
    const users = [
        '659c1639-db4f-4f39-9fc4-a016a4209834',
        'fc51361e-34fa-4be8-b47c-23c6925e8f69',
        '0964d722-446c-46a5-84e3-5fc60f6aafa6'
    ];
    const links = users.map(uid => ({ profile_id: uid, directorate_id: cpDir.id }));
    await supabase.from('profile_directorates').insert(links);
    console.log('Users linked to CP');
}

transform();
