import { createClient } from "@/utils/supabase/server"
import { SubmissionFormClient } from "./form-client"
import { FormDefinition } from "@/components/form-engine"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/utils/supabase/admin"
import { CP_FORM_DEFINITION } from "@/app/dashboard/cp-config"
import { BENEFICIOS_FORM_DEFINITION } from "@/app/dashboard/beneficios-config"
import { CRAS_FORM_DEFINITION } from "@/app/dashboard/cras-config"
import { CEAI_FORM_DEFINITION } from "@/app/dashboard/ceai-config"
import { CREAS_IDOSO_FORM_DEFINITION, CREAS_DEFICIENTE_FORM_DEFINITION } from "@/app/dashboard/creas-config"
import { POP_RUA_FORM_DEFINITION } from "@/app/dashboard/pop-rua-config"

export default async function NewReportPage({
    searchParams,
}: {
    searchParams: Promise<{ setor?: string, directorate_id?: string, unit?: string, subcategory?: string }>
}) {
    const { setor, directorate_id, unit, subcategory } = await searchParams
    const isCP = setor === 'centros'
    const isBeneficios = setor === 'beneficios'
    const isCRAS = setor === 'cras'
    const isCEAI = setor === 'ceai'
    const isCREAS = setor === 'creas'
    const isPopRua = setor === 'pop_rua'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const adminSupabase = createAdminClient()

    const { data: profile } = await adminSupabase
        .from('profiles')
        .select(`
            *,
            profile_directorates (
                directorates (*)
            )
        `)
        .eq('id', user.id)
        .single()

    const isAdmin = profile?.role === 'admin'

    let directorate = null;

    if (directorate_id) {
        // Fetch the requested directorate details using admin client
        const { data: requestedDirectorate } = await adminSupabase
            .from('directorates')
            .select('*')
            .eq('id', directorate_id)
            .single()

        if (requestedDirectorate) {
            // Check permissions: Admin or Linked
            // @ts-ignore
            const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

            const isLinked = userDirectorates.some((d: any) => d.id === directorate_id)

            if (isAdmin || isLinked) {
                directorate = requestedDirectorate
            } else {
                return (
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Acesso não autorizado</h2>
                        <p>Você não tem permissão para acessar a diretoria: <strong>{requestedDirectorate.name}</strong></p>
                    </div>
                )
            }
        }
    }

    // Fallback if no ID provided or not found
    if (!directorate) {
        // @ts-ignore
        const userDirectorates = profile?.profile_directorates?.map(pd => pd.directorates) || []

        // Try to find by keyword in assigned directorates
        if (isBeneficios) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('benefícios'))
        } else if (isCP || setor === 'sine') {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('profis') || d.name.toLowerCase().includes('sine'))
        } else if (isCRAS) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('cras'))
        } else if (isCEAI) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('ceai'))
        } else if (isCREAS) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('creas'))
        } else if (isPopRua) {
            directorate = userDirectorates.find((d: any) => d.name.toLowerCase().includes('populacao') && d.name.toLowerCase().includes('rua'))
        }

        // If still not found and admin, fetch all to try and find a match
        if (!directorate && isAdmin) {
            const { data: allDirs } = await adminSupabase.from('directorates').select('*')
            const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

            if (isBeneficios) {
                directorate = allDirs?.find(d => normalize(d.name).includes('beneficios'))
            } else if (isCP || setor === 'sine') {
                directorate = allDirs?.find(d => normalize(d.name).includes('profis') || normalize(d.name).includes('sine'))
            } else if (isCRAS) {
                directorate = allDirs?.find(d => normalize(d.name).includes('cras'))
            } else if (isCEAI) {
                directorate = allDirs?.find(d => normalize(d.name).includes('ceai'))
            } else if (isCREAS) {
                directorate = allDirs?.find(d => normalize(d.name).includes('creas'))
            } else if (isPopRua) {
                directorate = allDirs?.find(d => normalize(d.name).includes('populacao') && normalize(d.name).includes('rua'))
            }
        }

        if (!directorate) {
            if (userDirectorates.length === 0 && !isAdmin) {
                return <div>Erro: Sem diretoria vinculada.</div>
            }
            directorate = userDirectorates?.[0]
        }
    }

    if (!directorate) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Diretoria não encontrada ou sem permissão</h2>
                <p>Favor contatar o administrador ou verificar se você possui as permissões necessárias.</p>
            </div>
        )
    }

    // Choose Form Definition based on setor
    let formDefinition = (directorate as any).form_definition as FormDefinition
    let titleContext = directorate.name

    if (isCP) {
        formDefinition = CP_FORM_DEFINITION
        titleContext = `${directorate.name} (CP)`
    }

    if (isBeneficios) {
        formDefinition = BENEFICIOS_FORM_DEFINITION
        titleContext = "Benefícios Socioassistenciais"
    }

    if (isCRAS) {
        formDefinition = CRAS_FORM_DEFINITION
        titleContext = "CRAS"
    }

    if (isCEAI) {
        formDefinition = CEAI_FORM_DEFINITION
        titleContext = "CEAI"
    }

    if (setor === 'sine') {
        titleContext = `${directorate.name} (SINE)`
    }

    if (isPopRua) {
        formDefinition = POP_RUA_FORM_DEFINITION
        titleContext = "População de Rua e Migrantes"
    }

    if (isCREAS) {
        if (!subcategory) {
            // Selection Screen
            return (
                <div className="container mx-auto max-w-5xl py-20 px-6">
                    <div className="flex flex-col items-center justify-center space-y-12">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-50">
                                Selecione a Categoria
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-md mx-auto">
                                Escolha abaixo qual formulário do CREAS deseja preencher.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                            <Link href={`/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate?.id || ''}&subcategory=idoso`} className="group">
                                <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center cursor-pointer">
                                    <div className="h-20 w-20 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        {/* Simple Person Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">CREAS Idoso</h3>
                                    <p className="text-sm text-zinc-500 mt-2 font-medium">Relatório de violência e acompanhamento de idosos.</p>
                                </div>
                            </Link>

                            <Link href={`/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate?.id || ''}&subcategory=deficiente`} className="group">
                                <div className="h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center cursor-pointer">
                                    <div className="h-20 w-20 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        {/* Person Icon */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">CREAS Deficiente</h3>
                                    <p className="text-sm text-zinc-500 mt-2 font-medium">Relatório de violência e acompanhamento de PCDs.</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        if (subcategory === 'idoso') {
            formDefinition = CREAS_IDOSO_FORM_DEFINITION
            titleContext = "CREAS Idoso"
        } else if (subcategory === 'deficiente') {
            formDefinition = CREAS_DEFICIENTE_FORM_DEFINITION
            titleContext = "CREAS Deficiente"
        } else {
            // Fallback or Deficiente
            return (
                <div className="container mx-auto max-w-2xl py-20 text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Em construção</h2>
                    <p className="text-zinc-500">O formulário para PCD ainda será configurado.</p>
                    <Link href={`/dashboard/relatorios/novo?setor=creas&directorate_id=${directorate?.id || ''}`} className="mt-8 inline-block text-blue-600 font-bold hover:underline">
                        &larr; Voltar
                    </Link>
                </div>
            )
        }
    }

    if (!formDefinition) {
        return <div>Erro: Formulário não configurado.</div>
    }

    return (
        <div className="container mx-auto max-w-7xl py-8">
            <SubmissionFormClient
                definition={formDefinition}
                directorateName={titleContext}
                directorateId={directorate.id}
                setor={setor}
                unit={unit}
                subcategory={subcategory}
                isAdmin={isAdmin}
            />
        </div>
    )
}
