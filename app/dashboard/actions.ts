'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { updateSheetColumn, SheetConfig } from '@/lib/google-sheets'
import { redirect } from 'next/navigation'
import { FormDefinition } from '@/components/form-engine'

export async function submitReport(formData: Record<string, any>, month: number, year: number) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // Get User Profile & Directorate
    const { data: profile } = await supabase.from('profiles').select('*, directorates(*)').eq('id', user.id).single()

    if (!profile || !profile.directorates) {
        throw new Error("No directorate assigned")
    }

    const directorate = profile.directorates

    // Validação de Data: Não permitir enviar relatório do futuro (opcional, mas boa prática)
    // Mas permitiremos retroativo.

    // Check if already submitted
    const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('directorate_id', directorate.id)
        .eq('month', month)
        .eq('year', year)
        .single()

    if (existing) {
        // Se já existe, permitiremos ATUALIZAR (Sobrescrever)?
        // Para simplificar: Sim, vamos atualizar o registro existente.
        const { error: updateError } = await supabase
            .from('submissions')
            .update({ data: formData, created_at: new Date().toISOString() })
            .eq('id', existing.id)

        if (updateError) throw new Error("Erro ao atualizar relatório.")
    } else {
        // Save to Supabase (New)
        const submissionData = {
            user_id: user.id,
            directorate_id: directorate.id,
            month,
            year,
            data: formData,
        }

        const { error: dbError } = await supabase.from('submissions').insert(submissionData)

        if (dbError) {
            console.error("DB Error:", dbError)
            return { error: "Erro ao salvar no banco de dados." }
        }
    }

    // Save to Google Sheets
    if (directorate.sheet_config && directorate.form_definition) {
        try {
            const formDef = directorate.form_definition as FormDefinition

            // Map the form data to an ordered array based on the fields definition
            // We assume fields are in correct row order (Row 2, Row 3...)
            // Flatten sections fields
            const allFields = formDef.sections.flatMap(s => s.fields)

            const orderedValues = allFields.map(field => {
                const val = formData[field.id]
                // Convert to number strictly if possible, or empty string
                return val !== undefined && val !== '' ? Number(val) : 0
            })

            await updateSheetColumn(
                directorate.sheet_config as SheetConfig,
                month,
                orderedValues
            )

        } catch (sheetError: any) {
            console.error("Sheet Error Full:", JSON.stringify(sheetError, null, 2))
            // Retornar o erro detalhado para facilitar o debug
            return { error: `Erro Google Sheets: ${sheetError.message || sheetError.toString()}` }
        }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
