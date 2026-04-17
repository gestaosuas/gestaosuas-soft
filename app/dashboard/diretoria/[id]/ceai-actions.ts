'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCategorias(unit: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_categories')
        .select('*')
        .eq('unit', unit)
        .order('name')
    
    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }
    return data || []
}

export async function saveCategoria(unit: string, name: string, directorateId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_categories')
        .insert([{ unit, name, directorate_id: directorateId }])
        .select()
        .single()

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true, data }
}

export async function updateCategoria(id: string, name: string, directorateId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true, data }
}

export async function deleteCategoria(id: string, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_categories')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function getOficinasComCategorias(unit: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_oficinas')
        .select(`
            *,
            category:ceai_categories(*)
        `)
        .eq('unit', unit)
        .order('activity_name')

    if (error) {
        console.error('Error fetching oficinas:', error)
        return []
    }
    return data || []
}

export async function saveOficina(unit: string, name: string, categoryId: string, slots: number, occupied: number, directorateId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_oficinas')
        .insert([{ 
            unit, 
            activity_name: name, 
            category_id: categoryId === 'empty' ? null : categoryId,
            total_slots: slots,
            occupied_slots: occupied,
            directorate_id: directorateId 
        }])
        .select()
        .single()

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true, data }
}

export async function updateOficina(id: string, name: string, categoryId: string, directorateId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_oficinas')
        .update({ 
            activity_name: name,
            category_id: categoryId === 'empty' ? null : categoryId
        })
        .eq('id', id)
        .select()
        .single()

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true, data }
}

export async function updateOficinaCategoria(id: string, categoryId: string, directorateId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_oficinas')
        .update({ category_id: categoryId === 'empty' ? null : categoryId })
        .eq('id', id)
        .select()
        .single()

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true, data }
}

export async function deleteOficina(id: string, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_oficinas')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error }
    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}
