'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPopRuaReport(directorateId: string, month: number, year: number) {
    const supabase = await createClient()

    // 1. Try to fetch from the new robust table
    const { data: currentMonthData } = await supabase
        .from('creas_pop_rua_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (currentMonthData) {
        return currentMonthData
    }

    // 2. Fallback checking Legacy Submissions table (to preserve old history correctly on UI)
    const { data: legacyData } = await supabase
        .from('submissions')
        .select('data')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .eq('setor', 'pop_rua')
        // note: subcategory usually wasn't set for pop_rua or it was default.
        .single()

    if (legacyData && legacyData.data) {
        return {
            id: 'legacy-data',
            status: 'submitted',
            directorate_id: directorateId,
            month,
            year,
            ...legacyData.data
        }
    }

    // Since PopRua has zero Carry-Forward, we always just return a clean blank state initialized
    return {
        month,
        year,
        directorate_id: directorateId
    }
}

export async function savePopRuaReport(directorateId: string, month: number, year: number, data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    const payload = {
        ...data,
        directorate_id: directorateId,
        month,
        year,
        created_by: user.id,
        status: data.status || 'draft',
        updated_at: new Date().toISOString()
    }

    const { data: existing } = await supabase
        .from('creas_pop_rua_reports')
        .select('id')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        const { error: updateError } = await supabase
            .from('creas_pop_rua_reports')
            .update(payload)
            .eq('id', existing.id)

        if (updateError) {
            console.error("Error updating Pop Rua report:", updateError)
            return { success: false, error: updateError.message }
        }
    } else {
        const { error: insertError } = await supabase
            .from('creas_pop_rua_reports')
            .insert([payload])

        if (insertError) {
            console.error("Error inserting Pop Rua report:", insertError)
            return { success: false, error: insertError.message }
        }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function deletePopRuaReport(directorateId: string, month: number, year: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Não autorizado" }

    // Drop new robust database record
    const { error } = await supabase
        .from('creas_pop_rua_reports')
        .delete()
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)

    if (error) {
        console.error("Error unlocking Pop Rua:", error)
        return { success: false, error: error.message }
    }

    // Drop any legacy fallback data from submissions table
    await supabase
        .from('submissions')
        .delete()
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .eq('setor', 'pop_rua')

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}
