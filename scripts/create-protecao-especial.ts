
import { createAdminClient } from '../utils/supabase/admin'

async function createDirectorate() {
    const supabase = createAdminClient()
    
    const { data: existing } = await supabase
        .from('directorates')
        .select('id')
        .eq('name', 'Proteção Especial à Criança e Adolescente')
        .single()

    if (existing) {
        console.log('Directorate already exists:', existing.id)
        return
    }

    const { data, error } = await supabase
        .from('directorates')
        .insert({
            name: 'Proteção Especial à Criança e Adolescente',
            sheet_config: {},
            form_definition: { sections: [] }
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating directorate:', error)
    } else {
        console.log('Directorate created successfully:', data.id)
    }
}

createDirectorate()
