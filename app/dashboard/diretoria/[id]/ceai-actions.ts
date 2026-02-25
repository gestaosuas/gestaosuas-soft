'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCategorias(unit: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_categorias')
        .select('*')
        .eq('unit', unit)
        .order('name', { ascending: true })

    if (error) {
        console.error("Erro ao buscar categorias:", error)
        return []
    }
    return data
}

export async function saveCategoria(unit: string, name: string, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_categorias')
        .insert([{ unit, name }])

    if (error) {
        console.error("Erro ao salvar categoria:", error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function deleteCategoria(id: string, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_categorias')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Erro ao deletar categoria:", error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function saveOficina(unit: string, activity_name: string, category_id: string | null, vacancies: number, classes_count: number, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_oficinas')
        .insert([{
            unit,
            activity_name,
            category_id: category_id === 'empty' || !category_id ? null : category_id,
            vacancies,
            classes_count,
            total_vacancies: vacancies * classes_count
        }])

    if (error) {
        console.error("Erro ao salvar oficina:", error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function deleteOficina(id: string, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_oficinas')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Erro ao deletar oficina:", error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function updateOficinaCategoria(id: string, category_id: string | null, directorateId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('ceai_oficinas')
        .update({
            category_id: category_id === 'empty' || !category_id ? null : category_id
        })
        .eq('id', id)

    if (error) {
        console.error("Erro ao atualizar categoria da oficina:", error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/diretoria/${directorateId}`)
    return { success: true }
}

export async function getOficinasComCategorias(unit: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ceai_oficinas')
        .select(`
            *,
            categoria:category_id (name)
        `)
        .eq('unit', unit)
        .order('activity_name', { ascending: true })

    if (error) {
        console.error("Erro ao buscar oficinas:", error)
        return []
    }

    // Format response to include category_name flatly for easier access
    return data.map((item: any) => ({
        ...item,
        category_name: item.categoria?.name || 'Sem Categoria'
    }))
}
