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

async function deduplicate() {
    console.log('--- Deduplicating CREAS ---')

    // 1. Find all matches
    const { data: duplicates, error } = await supabase
        .from('directorates')
        .select('id, name, created_at')
        .ilike('name', '%CREAS Idoso%')
        .order('created_at', { ascending: true }) // Oldest first

    if (error) {
        console.error('Error finding duplicates:', error)
        return
    }

    if (!duplicates || duplicates.length <= 1) {
        console.log('No duplicates found or only one entry exists.')
        if (duplicates) console.table(duplicates)
        return
    }

    console.log(`Found ${duplicates.length} entries. Keeping the oldest one.`)
    console.table(duplicates)

    // Keep the first one (oldest), delete the rest
    const [keep, ...remove] = duplicates
    const idsToRemove = remove.map(d => d.id)

    console.log(`Keeping: ${keep.id} - ${keep.name}`)
    console.log(`Removing: ${idsToRemove.join(', ')}`)

    const { error: delError } = await supabase
        .from('directorates')
        .delete()
        .in('id', idsToRemove)

    if (delError) {
        console.error('Error deleting duplicates:', delError)
    } else {
        console.log('✅ Duplicates removed successfully.')
    }
}

deduplicate()
