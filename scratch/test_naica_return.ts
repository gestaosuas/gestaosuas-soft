import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data: dirs } = await supabase.from('directorates').select('id, name').ilike('name', '%naica%')
  console.log("Directorates:", dirs)
  
  const directorateId = dirs[0].id // Use the accurate one!
  const unitName = "Jdm Célia"
  const month = 4
  const year = 2026

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    let pastMasc = 0;
    let pastFem = 0;

  const { data: nr } = await supabase
    .from('naica_reports')
    .select('*')

  console.log("All NAICA Reports:", nr)
        month,
        year,
        directorate_id: directorateId,
        unit_name: unitName,
        mes_anterior_masc: pastMasc,
        mes_anterior_fem: pastFem,
    })
        year,
        directorate_id: directorateId,
        unit_name: unitName,
        mes_anterior_masc: pastMasc,
        mes_anterior_fem: pastFem,
    })
}

test()
