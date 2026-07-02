
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS if needed

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase.from('directorates').select('*')
    if (error) {
        console.error(error)
        return
    }
    console.log(JSON.stringify(data, null, 2))
}

check()
