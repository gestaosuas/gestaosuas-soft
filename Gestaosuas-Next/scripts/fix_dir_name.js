import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndUpdate() {
    console.log('Checking directorates...')
    const { data, error } = await supabase.from('directorates').select('id, name')
    if (error) {
        console.error('Error fetching:', error)
        return
    }
    console.log('Current directorates:', JSON.stringify(data, null, 2))

    const targetId = 'd9f66b00-4782-4fc3-a064-04029529054b'
    const target = data.find(d => d.id === targetId)

    if (target) {
        console.log(`Found target directorate (ID: ${targetId}): ${target.name}`)
        if (target.name !== 'Qualificação Profissional e SINE') {
            console.log('Updating name to Qualificação Profissional e SINE...')
            const { error: updateError } = await supabase
                .from('directorates')
                .update({ name: 'Qualificação Profissional e SINE' })
                .eq('id', targetId)

            if (updateError) {
                console.error('Update error:', updateError)
            } else {
                console.log('Update successful!')
            }
        } else {
            console.log('Name is already correct in DB.')
        }
    } else {
        console.log('Target ID not found. Trying by name match...')
        const byName = data.find(d => d.name.includes('Formação') && d.name.includes('SINE'))
        if (byName) {
            console.log(`Found by name: ${byName.name} (ID: ${byName.id})`)
            const { error: updateError } = await supabase
                .from('directorates')
                .update({ name: 'Qualificação Profissional e SINE' })
                .eq('id', byName.id)
            if (updateError) console.error('Update error:', updateError)
            else console.log('Update successful!')
        } else {
            console.log('Could not find directorate by name either.')
        }
    }
}

checkAndUpdate()
