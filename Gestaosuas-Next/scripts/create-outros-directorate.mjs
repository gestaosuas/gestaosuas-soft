
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
const envConfig = dotenv.parse(fs.readFileSync(envPath))

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('Checking for "Outros" directorate...')
    const { data: existing, error: fetchError } = await supabase
        .from('directorates')
        .select('id')
        .eq('name', 'Outros')
        .maybeSingle()

    if (fetchError) {
        console.error('Error fetching directorate:', fetchError)
        process.exit(1)
    }

    if (existing) {
        console.log('"Outros" directorate already exists with ID:', existing.id)
        process.exit(0)
    }

    console.log('Creating "Outros" directorate...')
    const { data, error } = await supabase
        .from('directorates')
        .insert({ name: 'Outros' })
        .select()
        .single()

    if (error) {
        console.error('Error creating directorate:', error)
        process.exit(1)
    }

    console.log('"Outros" directorate created successfully with ID:', data.id)
}

main()
