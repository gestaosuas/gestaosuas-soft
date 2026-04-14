'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getCreasIdosoReport(directorateId: string, month: number, year: number) {
    const supabase = await createClient()

    // Find current month's report
    const { data: currentMonthData } = await supabase
        .from('creas_idoso_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (currentMonthData) {
        return currentMonthData
    }

    // Carry forward calculation logic: ONLY fetch the (Total - Desligados) from the previous chronological month
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    const { data: prevMonthData } = await supabase
        .from('creas_idoso_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .single()

    const prefixes = [
        'violencia_fisica',
        'abuso_sexual',
        'exploracao_sexual',
        'negligencia',
        'exploracao_financeira'
    ]

    const newData: any = {
        month,
        year,
        directorate_id: directorateId,
    }

    if (prevMonthData) {
        prefixes.forEach(prefix => {
            const prevTotal = Number(prevMonthData[`${prefix}_total`]) || 0
            const prevDesligados = Number(prevMonthData[`${prefix}_desligados`]) || 0

            // The new "atendidas anterior" is the amount that stayed active
            if (prevTotal > 0 || prevDesligados > 0) {
                newData[`${prefix}_atendidas_anterior`] = Math.max(0, prevTotal - prevDesligados)
            }
        })
    }

    return newData
}

export async function saveCreasIdosoReport(directorateId: string, month: number, year: number, data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    // Merge status and metadata
    const payload = {
        ...data,
        directorate_id: directorateId,
        month,
        year,
        created_by: user.id,
        status: data.status || 'draft',
        updated_at: new Date().toISOString()
    }

    // Attempt to update first
    const { data: existing } = await supabase
        .from('creas_idoso_reports')
        .select('id')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        const { error: updateError } = await supabase
            .from('creas_idoso_reports')
            .update(payload)
            .eq('id', existing.id)

        if (updateError) {
            console.error("Error updating CREAS Idoso report:", updateError)
            return { success: false, error: updateError.message }
        }
    } else {
        const { error: insertError } = await supabase
            .from('creas_idoso_reports')
            .insert([payload])

        if (insertError) {
            console.error("Error inserting CREAS Idoso report:", insertError)
            return { success: false, error: insertError.message }
        }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function getCreasPcdReport(directorateId: string, month: number, year: number) {
    const supabase = await createClient()

    const { data: currentMonthData } = await supabase
        .from('creas_pcd_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (currentMonthData) {
        return currentMonthData
    }

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    const { data: prevMonthData } = await supabase
        .from('creas_pcd_reports')
        .select('*')
        .eq('directorate_id', directorateId)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .single()

    const prefixes = [
        'def_violencia_fisica',
        'def_abuso_sexual',
        'def_exploracao_sexual',
        'def_negligencia',
        'def_exploracao_financeira'
    ]

    const newData: any = {
        month,
        year,
        directorate_id: directorateId,
    }

    if (prevMonthData) {
        prefixes.forEach(prefix => {
            const prevTotal = Number(prevMonthData[`${prefix}_total`]) || 0
            const prevDesligados = Number(prevMonthData[`${prefix}_desligados`]) || 0

            if (prevTotal > 0 || prevDesligados > 0) {
                newData[`${prefix}_atendidas_anterior`] = Math.max(0, prevTotal - prevDesligados)
            }
        })
    }

    return newData
}

export async function saveCreasPcdReport(directorateId: string, month: number, year: number, data: any) {
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
        .from('creas_pcd_reports')
        .select('id')
        .eq('directorate_id', directorateId)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        const { error: updateError } = await supabase
            .from('creas_pcd_reports')
            .update(payload)
            .eq('id', existing.id)

        if (updateError) {
            console.error("Error updating CREAS PCD report:", updateError)
            return { success: false, error: updateError.message }
        }
    } else {
        const { error: insertError } = await supabase
            .from('creas_pcd_reports')
            .insert([payload])

        if (insertError) {
            console.error("Error inserting CREAS PCD report:", insertError)
            return { success: false, error: insertError.message }
        }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}
