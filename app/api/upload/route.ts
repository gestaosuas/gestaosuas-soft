
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const fileExt = file.name.split('.').pop()
        const fileName = `logo-${Date.now()}.${fileExt}`
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data, error } = await supabaseAdmin
            .storage
            .from('system-assets')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            console.error('Upload error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('system-assets')
            .getPublicUrl(fileName)

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Server error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
