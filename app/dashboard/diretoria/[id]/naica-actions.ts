'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getNaicaReport(directorateId: string, unitName: string, month: number, year: number) {
    const supabase = await createClient()

    // 1. Try to fetch from the new robust table
    const { data: currentMonthData } = await supabase
        .from('naica_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('unit_name', unitName)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (currentMonthData) {
        return currentMonthData
    }

    // 2. Fallback checking Legacy Submissions table (to preserve old history correctly on UI)
    const { data: legacyRows } = await supabase
        .from('submissions')
        .select('data')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        
    const legacyData = legacyRows?.find(r => r.data?._setor === 'naica')

    if (legacyData && legacyData.data && legacyData.data.units && legacyData.data.units[unitName]) {
        // Legacy system stored NAICA multi-unit data inside `units` object.
        return {
            id: 'legacy-data',
            status: 'submitted',
            directorate_id: directorateId,
            unit_name: unitName,
            month,
            year,
            ...legacyData.data.units[unitName]
        }
    }

    // 3. Mathematical Carry-Forward Logic
    // We look for the immediately preceding month.
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    // Check robust table for past month
    let pastMasc = 0;
    let pastFem = 0;

    const { data: prevMonthData } = await supabase
        .from('naica_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('unit_name', unitName)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .single()

    if (prevMonthData) {
        pastMasc = Math.max(0, (prevMonthData.mes_anterior_masc + prevMonthData.inseridos_masc) - prevMonthData.desligados_masc)
        pastFem = Math.max(0, (prevMonthData.mes_anterior_fem + prevMonthData.inseridos_fem) - prevMonthData.desligados_fem)
    } else {
        // Check legacy fallback for past month
        const { data: prevLegacyRows } = await supabase
            .from('submissions')
            .select('data')
            .eq('directorate_id', directorateId)
            .eq('month', prevMonth)
            .eq('year', prevYear)

        const prevLegacyData = prevLegacyRows?.find(r => r.data?._setor === 'naica')

        if (prevLegacyData && prevLegacyData.data && prevLegacyData.data.units && prevLegacyData.data.units[unitName]) {
            const pastLegacyUnit = prevLegacyData.data.units[unitName]
            pastMasc = Math.max(0, (Number(pastLegacyUnit.mes_anterior_masc || 0) + Number(pastLegacyUnit.inseridos_masc || 0)) - Number(pastLegacyUnit.desligados_masc || 0))
            pastFem = Math.max(0, (Number(pastLegacyUnit.mes_anterior_fem || 0) + Number(pastLegacyUnit.inseridos_fem || 0)) - Number(pastLegacyUnit.desligados_fem || 0))
        }
    }

    return {
        month,
        year,
        directorate_id: directorateId,
        unit_name: unitName,
        mes_anterior_masc: pastMasc,
        mes_anterior_fem: pastFem,
    }
}

export async function saveNaicaReport(directorateId: string, unitName: string, month: number, year: number, data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    const payload = {
        ...data,
        directorate_id: directorateId,
        user_id: user.id,
        unit_name: unitName,
        month,
        year,
        created_by: user.id,
        status: data.status || 'draft',
        updated_at: new Date().toISOString()
    }

    const { data: existing } = await supabase
        .from('naica_reports')
        .select('id')
        .eq('directorate_id', directorateId)
        .eq('unit_name', unitName)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        const { error: updateError } = await supabase
            .from('naica_reports')
            .update(payload)
            .eq('id', existing.id)

        if (updateError) {
            console.error("Error updating Naica report:", updateError)
            return { success: false, error: updateError.message }
        }
    } else {
        const { error: insertError } = await supabase
            .from('naica_reports')
            .insert([payload])

        if (insertError) {
            console.error("Error inserting Naica report:", insertError)
            return { success: false, error: insertError.message }
        }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function deleteNaicaReport(directorateId: string, unitName: string, month: number, year: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Não autorizado" }

    // Drop new robust database record
    const { error } = await supabase
        .from('naica_reports')
        .delete()
        .eq('directorate_id', directorateId)
        .eq('unit_name', unitName)
        .eq('month', month)
        .eq('year', year)

    if (error) {
        console.error("Error unlocking Naica:", error)
        return { success: false, error: error.message }
    }

    // Drop legacy data?
    // Since NAICA is multi-unit, doing a DELETE on the entire "submissions" row will destroy ALL other Naicas in that month!
    // Instead, we must UPDATE the submissions JSON to strip out this specific unit.
    const { data: legacyRows } = await supabase
        .from('submissions')
        .select('id, data')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)

    const existingLegacy = legacyRows?.find(r => r.data?._setor === 'naica')

    if (existingLegacy && existingLegacy.data && existingLegacy.data.units) {
        const newData = { ...existingLegacy.data }
        delete newData.units[unitName]
        
        // If it was the last unit, just delete the row.
        if (Object.keys(newData.units).length === 0) {
            await supabase.from('submissions').delete().eq('id', existingLegacy.id)
        } else {
            await supabase.from('submissions').update({ data: newData }).eq('id', existingLegacy.id)
        }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}
