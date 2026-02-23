import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const unitsConfig = {
  cras: [
    "Campo Alegre", "Custódio Pereira", "Jardim Brasília", "Jardim Célia",
    "Mansour", "Marta Helena", "Morumbi", "São Jorge", "Tapuirama",
    "Shopping Park", "Pequis", "Canaã", "Tocantins"
  ],
  creas: [
    "Centro", "Norte", "Sul"
  ],
  ceai: [
    "Brasil", "Laranjeiras", "Luizote", "Guarani", "Morumbi"
  ],
  naica: [
    "Canaã", "Jdm Célia", "Lagoinha", "Luizote", "Mansour",
    "Marta Helena", "Morumbi", "Pequis", "Tibery", "Tocantins", "Tapuirama"
  ]
}

// Normalized names for mapping
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

async function seedUnits() {
  const { data: directorates, error } = await supabaseAdmin.from('directorates').select('*')
  if (error) {
    console.error("Error fetching directorates:", error)
    return
  }

  for (const dir of directorates) {
    const normName = normalize(dir.name)
    let available_units: string[] | null = null

    if (normName.includes('cras')) {
      available_units = unitsConfig.cras
    } else if (normName.includes('creas')) {
      // Only Protetivo and Socioeducativo or generally CREAS?
      // Both CREAS can have these units. Usually: CREAS CENTRO, SUL, NORTE. 
      // Wait, does "CREAS Pessoa com Deficiência" or "CREAS Idoso" have units? Our system handles subcategories.
      // Let's just give all CREAS these available units.
      available_units = unitsConfig.creas
    } else if (normName.includes('ceai')) {
      available_units = unitsConfig.ceai
    } else if (normName.includes('naica')) {
      available_units = unitsConfig.naica
    }

    if (available_units) {
      console.log(`Updating ${dir.name} with ${available_units.length} units...`)
      const { error: updateError } = await supabaseAdmin
        .from('directorates')
        .update({ available_units })
        .eq('id', dir.id)

      if (updateError) {
        console.error(`Failed to update ${dir.name}:`, updateError)
      } else {
        console.log(`Successfully updated ${dir.name}`)
      }
    } else {
      console.log(`Skipping ${dir.name}...`)
    }
  }

  console.log("Seeding complete.")
}

seedUnits()
