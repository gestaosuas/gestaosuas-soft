
import { createAdminClient } from './utils/supabase/admin'

async function debugSubmissions() {
    const supabase = createAdminClient()
    const directorateId = '86e680a3-394c-4731-90de-6f29e1f57930' // I need to find the actual ID for CP

    // First find the directorate ID for "Centro Profissionalizante" or "Qualificação Profissional"
    const { data: dirs } = await supabase.from('directorates').select('id, name')
    console.log("Directorates:", dirs)

    const cpDir = dirs?.find(d => d.name.toLowerCase().includes('profissional') || d.name.toLowerCase().includes('qualificacao'))
    
    if (!cpDir) {
        console.log("CP Directorate not found")
        return
    }

    console.log(`Checking submissions for CP (ID: ${cpDir.id})...`)

    const { data: subs, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('directorate_id', cpDir.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    if (error) {
        console.error("Error fetching submissions:", error)
    } else {
        console.log(`Found ${subs?.length} submissions.`)
        subs?.forEach(s => {
            const hasFlat = !!s.data?._report_content
            const hasCentros = !!s.data?._report_content_centros
            const hasSine = !!s.data?._report_content_sine
            console.log(`Month: ${s.month}/${s.year} | Setor: ${s.data?._setor} | HasCentros: ${hasCentros} | HasFlat: ${hasFlat} | HasSine: ${hasSine}`)
        })
    }
}

debugSubmissions()
