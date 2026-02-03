'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    try {
        console.log("Attempting login for:", data.email)
        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            console.error("Supabase Auth Error:", error.message)
            redirect(`/login?error=${encodeURIComponent(error.message)}`)
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } catch (err: any) {
        // If it was already a redirect (Next.js uses errors for redirects), just throw it
        if (err.digest?.includes('NEXT_REDIRECT')) throw err;

        console.error("Login Action Crash:", err)
        const errorMessage = err.message || "Erro inesperado"
        redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }
}
