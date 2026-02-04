import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listAll() {
    console.log('--- Listing ALL Directorates (JSON) ---')
    const { data: dirs } = await supabase
        .from('directorates')
        .select('id, name')
        .order('name')

    console.log(JSON.stringify(dirs, null, 2))
}

listAll()
