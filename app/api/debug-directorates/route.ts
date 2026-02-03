import { createAdminClient } from "@/utils/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('directorates').select('*')

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ data })
}
