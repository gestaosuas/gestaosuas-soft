import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const directorateId = "9b713328-f38a-4df0-a664-a7b8bb48cd42"
  const unitName = "Jdm Célia"
  const month = 4
  const year = 2026

  const prevMonth = 3
  const prevYear = 2026

  const { data: allRows } = await supabase
    .from('submissions')
    .select('id, month, year, directorate_id, data')
    .ilike('data->>_setor', '%naica%')

  const { data: multiRows } = await supabase
    .from('submissions')
    .select('id, month, year, directorate_id, data')
    .eq('data->>_is_multi_unit', 'true')

  const total = [...(allRows||[]), ...(multiRows||[])]
  const target = total.find(r => r.month === 3 && r.year === 2026 && JSON.stringify(r.data).includes('naica'))
  
  console.log("Target Row found?", !!target)
  if (target) {
      console.log("Target ID:", target.id)
      console.log("Target Directorate:", target.directorate_id)
      console.log("Target Data:", JSON.stringify(target.data, null, 2))
  }
}

test()
