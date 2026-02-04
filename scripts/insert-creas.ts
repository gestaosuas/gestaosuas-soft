import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function insertCREAS() {
    console.log('Inserting CREAS Directorate...')

    // Check if it already exists to avoid duplicates
    const { data: existing } = await supabase
        .from('directorates')
        .select('id')
        .ilike('name', '%CREAS Idoso%')
        .single()

    if (existing) {
        console.log(`Directorate already exists with ID: ${existing.id}`)
        return
    }

    const { data, error } = await supabase
        .from('directorates')
        .insert({
            name: 'CREAS Idoso e Pessoa com Deficiência',
            // Default configuration - can be adjusted later
            description: 'Centro de Referência Especializado de Assistência Social',
        })
        .select()
        .single()

    if (error) {
        console.error('Error inserting directorate:', error)
    } else {
        console.log(`Successfully inserted CREAS with ID: ${data.id}`)
    }
}

insertCREAS()
