const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define default colors for known categories from the CSV
const categoryColors = {
    'CRAS': 'blue',
    'NAICA': 'green',
    'CEAI': 'yellow',
    'Condomínio': 'violet',
    'Centro Profissionalizante': 'orange',
    'SINE': 'grey',
    'CREAS': 'red',
    'População de Rua': 'black',
    'Casa Dia': 'blue',
    'Casa da Mulher': 'violet',
    'Complexo': 'grey',
    'Conselho Tutelar': 'red',
    'Conselho Municipal': 'orange',
    'OSCs SUBVENC': 'gold',
};

async function importCSV() {
    const filePath = path.resolve(__dirname, '..', 'dados_mapas.csv');

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const categories = new Set();
    const units = [];
    let isFirstLine = true;

    console.log("Parsing CSV...");

    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            continue; // Skip header
        }

        if (!line.trim()) continue;

        // Handle CSV parsing considering quotes
        const fields = [];
        let currentField = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        fields.push(currentField);

        if (fields.length >= 6) {
            const [unidade, tipo, endereco, telefone, regiao, coordenadas] = fields.map(f => f.trim());

            if (!unidade || !coordenadas) continue;

            categories.add(tipo);

            // Parse coordinates
            // format is expected to be "-18.xxx, -48.yyy"
            const coordsParts = coordenadas.split(',').map(c => c.trim());

            let lat = 0;
            let lng = 0;

            if (coordsParts.length === 2) {
                lat = parseFloat(coordsParts[0]);
                lng = parseFloat(coordsParts[1]);
            }

            units.push({
                unidade,
                tipo,
                endereco,
                telefone,
                regiao,
                lat,
                lng
            });
        }
    }

    console.log(`Found ${categories.size} unique categories and ${units.length} valid units.`);

    // 1. Ensure categories exist in Supabase
    console.log("Upserting Categories...");
    const categoryMap = new Map();

    for (const catName of categories) {
        if (!catName) continue;

        const color = categoryColors[catName] || 'blue'; // default to blue if unknown

        const { data, error } = await supabase
            .from('map_categories')
            .upsert({ name: catName, color: color }, { onConflict: 'name' })
            .select('id, name')
            .single();

        if (error) {
            console.error(`Error upserting category '${catName}':`, error);
        } else if (data) {
            categoryMap.set(data.name, data.id);
        }
    }

    // 2. Insert Units
    console.log("Inserting Units...");
    let inserts = 0;

    for (const unit of units) {
        const categoryId = categoryMap.get(unit.tipo) || null;

        if (isNaN(unit.lat) || isNaN(unit.lng)) {
            console.warn(`Skipping unit ${unit.unidade} due to invalid coordinates.`);
            continue;
        }

        const { error } = await supabase
            .from('map_units')
            .insert({
                name: unit.unidade,
                category_id: categoryId,
                address: unit.endereco || null,
                phone: unit.telefone || null,
                region: unit.regiao || null,
                latitude: unit.lat,
                longitude: unit.lng
            })

        if (error) {
            // Ignore duplicate errors if they exist, or log others
            if (error.code !== '23505') { // postgres unique violation
                console.error(`Error inserting unit '${unit.unidade}':`, error);
            }
        } else {
            inserts++;
        }
    }

    console.log(`Finished! Successfully processed approximately ${inserts} units.`);
}

importCSV().catch(console.error);
