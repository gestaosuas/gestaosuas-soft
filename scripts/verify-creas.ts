import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndInsert() {
    console.log('--- Checking Directorates ---')
    const { data: dirs, error: listError } = await supabase.from('directorates').select('id, name')

    if (listError) {
        console.error('Error listing directorates:', JSON.stringify(listError, null, 2))
    } else {
        console.table(dirs)
    }

    const creas = dirs?.find(d => d.name.toLowerCase().includes('creas'))

    if (creas) {
        console.log(`\n✅ CREAS already exists: ${creas.name} (${creas.id})`)
    } else {
        console.log('\n⚠️ CREAS not found. Attempting insertion...')
        const { data, error } = await supabase
            .from('directorates')
            .insert({
                name: 'CREAS Idoso e Pessoa com Deficiência',
                // description field removed as it might not exist
            })
            .select()

        if (error) {
            console.error('❌ Insertion Failed:', JSON.stringify(error, null, 2))
        } else {
            console.log('✅ Insertion Successful:', data)
        }
    }
}

checkAndInsert()
