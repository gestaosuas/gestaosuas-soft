import { getNaicaReport } from './app/dashboard/diretoria/[id]/naica-actions'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function test() {
    const directorateId = "9b713328-f38a-4df0-a664-a7b8bb48cd42" // NAICA ID from previous logs
    const res = await getNaicaReport(directorateId, 'Jdm Célia', 4, 2026)
    console.log(JSON.stringify(res, null, 2))
}

test()
