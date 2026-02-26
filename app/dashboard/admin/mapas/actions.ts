'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Categories ---

export async function getMapCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('map_categories')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching map categories:', error)
        throw new Error('Falha ao carregar as categorias.')
    }

    return data
}

export async function createMapCategory(formData: FormData) {
    const name = formData.get('name') as string
    const color = formData.get('color') as string

    if (!name || !color) {
        return { error: 'Nome e cor são campos obrigatórios.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('map_categories')
        .insert({ name, color })

    if (error) {
        console.error('Error creating map category:', error)
        if (error.code === '23505') { // Unique constraint violation
            return { error: 'Já existe uma categoria com este nome.' }
        }
        return { error: 'Falha ao criar categoria.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}

export async function updateMapCategory(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const color = formData.get('color') as string

    if (!name || !color) {
        return { error: 'Nome e cor são campos obrigatórios.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('map_categories')
        .update({ name, color })
        .eq('id', id)

    if (error) {
        console.error('Error updating map category:', error)
        if (error.code === '23505') {
            return { error: 'Já existe uma categoria com este nome.' }
        }
        return { error: 'Falha ao atualizar categoria.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}

export async function deleteMapCategory(id: string) {
    const supabase = await createClient()

    // Check if there are units using this category
    const { count } = await supabase
        .from('map_units')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

    if (count && count > 0) {
        return { error: 'Não é possível excluir esta categoria pois existem unidades vinculadas a ela.' }
    }

    const { error } = await supabase
        .from('map_categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting map category:', error)
        return { error: 'Falha ao excluir categoria.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}

// --- Units ---

export async function getMapUnits() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('map_units')
        .select(`
            *,
            map_categories (
                id,
                name,
                color
            )
        `)
        .order('name')

    if (error) {
        console.error('Error fetching map units:', error)
        throw new Error('Falha ao carregar as unidades.')
    }

    return data
}

export async function createMapUnit(formData: FormData) {
    const name = formData.get('name') as string
    const category_id = formData.get('category_id') as string
    const region = formData.get('region') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    if (!name || !category_id || isNaN(latitude) || isNaN(longitude)) {
        return { error: 'Nome, Categoria e Coordenadas Válidas são obrigatórios.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('map_units')
        .insert({
            name,
            category_id: category_id === 'null' ? null : category_id,
            region,
            address,
            phone,
            latitude,
            longitude
        })

    if (error) {
        console.error('Error creating map unit:', error)
        return { error: 'Falha ao criar unidade.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}

export async function updateMapUnit(id: string, formData: FormData) {
    const name = formData.get('name') as string
    const category_id = formData.get('category_id') as string
    const region = formData.get('region') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    if (!name || !category_id || isNaN(latitude) || isNaN(longitude)) {
        return { error: 'Nome, Categoria e Coordenadas Válidas são obrigatórios.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('map_units')
        .update({
            name,
            category_id: category_id === 'null' ? null : category_id,
            region,
            address,
            phone,
            latitude,
            longitude
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating map unit:', error)
        return { error: 'Falha ao atualizar unidade.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}

export async function deleteMapUnit(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('map_units')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting map unit:', error)
        return { error: 'Falha ao excluir unidade.' }
    }

    revalidatePath('/dashboard/admin/mapas')
    revalidatePath('/dashboard/mapas/unidades')
    return { success: true }
}
