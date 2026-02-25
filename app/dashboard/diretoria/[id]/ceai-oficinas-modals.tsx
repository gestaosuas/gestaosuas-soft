'use client'

import { useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CheckCircle2, Loader2, Tags, Trash2, Layers } from "lucide-react"
import { saveCategoria, saveOficina, getCategorias, deleteCategoria, getOficinasComCategorias, deleteOficina, updateOficinaCategoria } from "./ceai-actions"

export function CEAIOficinasModals({ unit, directorateId }: { unit: string, directorateId: string }) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isOficinaOpen, setIsOficinaOpen] = useState(false)

    const [categoryName, setCategoryName] = useState("")
    const [categories, setCategories] = useState<any[]>([])
    const [oficinas, setOficinas] = useState<any[]>([])
    const [categoryMessage, setCategoryMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
    const [oficinaMessage, setOficinaMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

    const [vacancies, setVacancies] = useState<number>(0)
    const [classesCount, setClassesCount] = useState<number>(0)
    const totalVacancies = vacancies * classesCount

    const [isPending, startTransition] = useTransition()

    const loadCategories = async () => {
        const cats = await getCategorias(unit)
        setCategories(cats)
    }

    const loadOficinas = async () => {
        const ofis = await getOficinasComCategorias(unit)
        setOficinas(ofis)
    }

    const handleOpenOficina = async () => {
        setIsOficinaOpen(true)
        await Promise.all([loadCategories(), loadOficinas()])
    }

    const handleOpenCategory = async (open: boolean) => {
        setIsCategoryOpen(open)
        if (open) {
            await loadCategories()
        }
    }

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryName) return
        startTransition(async () => {
            const res = await saveCategoria(unit, categoryName, directorateId)
            if (res.success) {
                setCategoryMessage({ type: 'success', text: 'Categoria salva com sucesso!' })
                setCategoryName("")
                await loadCategories()
                setTimeout(() => setCategoryMessage(null), 3500)
            } else {
                setCategoryMessage({ type: 'error', text: 'Erro ao salvar categoria.' })
            }
        })
    }

    const handleDeleteCategory = (id: string) => {
        if (!confirm('Deseja realmente excluir esta categoria?')) return
        startTransition(async () => {
            const res = await deleteCategoria(id, directorateId)
            if (res.success) {
                setCategoryMessage({ type: 'info', text: 'Categoria excluída.' })
                await loadCategories()
                setTimeout(() => setCategoryMessage(null), 3000)
            } else {
                setCategoryMessage({ type: 'error', text: 'Erro ao excluir categoria. Verifique se existem oficinas vinculadas a ela.' })
            }
        })
    }

    const handleSaveOficina = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const activity_name = formData.get('activity_name') as string
        const category_id = formData.get('category_id') as string

        if (!activity_name || isNaN(vacancies) || isNaN(classesCount)) return

        startTransition(async () => {
            const res = await saveOficina(unit, activity_name, category_id, vacancies, classesCount, directorateId)
            if (res.success) {
                setOficinaMessage({ type: 'success', text: 'Oficina salva com sucesso!' })
                setVacancies(0)
                setClassesCount(0)
                await loadOficinas()
                // clean the remaining form
                const form = e.target as HTMLFormElement
                form.reset()
                setTimeout(() => setOficinaMessage(null), 3500)
            } else {
                setOficinaMessage({ type: 'error', text: 'Erro ao salvar oficina.' })
            }
        })
    }

    const handleDeleteOficina = (id: string) => {
        if (!confirm('Deseja realmente excluir esta oficina?')) return
        startTransition(async () => {
            const res = await deleteOficina(id, directorateId)
            if (res.success) {
                setOficinaMessage({ type: 'info', text: 'Oficina excluída.' })
                await loadOficinas()
                setTimeout(() => setOficinaMessage(null), 3000)
            } else {
                setOficinaMessage({ type: 'error', text: 'Erro ao excluir oficina.' })
            }
        })
    }

    const handleCategoryChange = (ofiId: string, value: string) => {
        startTransition(async () => {
            const res = await updateOficinaCategoria(ofiId, value, directorateId)
            if (res.success) {
                setOficinaMessage({ type: 'success', text: 'Categoria atualizada!' })
                await loadOficinas()
                setTimeout(() => setOficinaMessage(null), 3000)
            } else {
                setOficinaMessage({ type: 'error', text: 'Erro ao atualizar categoria.' })
            }
        })
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <Dialog open={isOficinaOpen} onOpenChange={setIsOficinaOpen}>
                <DialogTrigger asChild>
                    <button onClick={handleOpenOficina} className="flex items-center justify-start w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
                        <Users className="w-3.5 h-3.5 mr-2" />
                        Cadastrar Oficina
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Cadastrar Oficina - {unit}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <form onSubmit={handleSaveOficina} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="activity_name">Nome da Atividade</Label>
                                <Input id="activity_name" name="activity_name" required placeholder="Ex: Informática Básica" disabled={isPending} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Categoria (Tags)</Label>
                                <Select name="category_id" defaultValue="empty" disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sem Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="empty">Sem categoria</SelectItem>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vacancies">Vagas/Turma</Label>
                                    <Input id="vacancies" name="vacancies" type="number" min="0" required value={vacancies || ""} onChange={e => setVacancies(Number(e.target.value) || 0)} disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="classes_count">Nº de Turmas</Label>
                                    <Input id="classes_count" name="classes_count" type="number" min="0" required value={classesCount || ""} onChange={e => setClassesCount(Number(e.target.value) || 0)} disabled={isPending} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total_vacancies">Vagas Disp.</Label>
                                    <Input id="total_vacancies" name="total_vacancies" type="number" value={totalVacancies} disabled className="bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed" />
                                </div>
                            </div>
                            {oficinaMessage && (
                                <div className={`p-3 text-sm rounded-md ${oficinaMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    oficinaMessage.type === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {oficinaMessage.text}
                                </div>
                            )}
                            <div className="pt-2">
                                <button type="submit" className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50" disabled={isPending}>
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    {isPending ? "Salvando..." : "Salvar Oficina"}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Oficinas Registradas</Label>
                            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[250px] overflow-y-auto">
                                {oficinas.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-400 italic">
                                        Nenhuma oficina cadastrada
                                    </div>
                                ) : (
                                    oficinas.map(ofi => (
                                        <div key={ofi.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{ofi.activity_name}</span>
                                                    <Select
                                                        value={ofi.category_id || "empty"}
                                                        onValueChange={(val) => handleCategoryChange(ofi.id, val)}
                                                        disabled={isPending}
                                                    >
                                                        <SelectTrigger className="h-6 text-[10px] py-0 px-2 w-auto bg-zinc-100 dark:bg-zinc-800 border-none rounded-full text-zinc-500 font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="empty">Sem categoria</SelectItem>
                                                            {categories.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        {ofi.vacancies} vagas/turma
                                                    </span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span className="flex items-center gap-1">
                                                        {ofi.classes_count} turmas
                                                    </span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                                        Total: {ofi.total_vacancies}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteOficina(ofi.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Excluir oficina"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCategoryOpen} onOpenChange={handleOpenCategory}>
                <DialogTrigger asChild>
                    <button className="flex items-center justify-start w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-medium text-zinc-700 dark:text-zinc-300 transition-colors">
                        <Tags className="w-3.5 h-3.5 mr-2" />
                        Categoria
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Tags className="w-5 h-5" /> Adicionar Categoria - {unit}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_name">Nome da Categoria (Tag)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="category_name"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required placeholder="Ex: Esportes, Cultura..."
                                        disabled={isPending}
                                        className="h-10"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap h-10 flex items-center gap-2"
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </form>

                        {categoryMessage && (
                            <div className={`p-3 text-sm rounded-md ${categoryMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                categoryMessage.type === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {categoryMessage.text}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categorias Registradas</Label>
                            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[200px] overflow-y-auto">
                                {categories.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-400 italic">
                                        Nenhuma categoria cadastrada
                                    </div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group">
                                            <div className="flex items-center gap-2">
                                                <Tags className="w-3.5 h-3.5 text-blue-500 opacity-60" />
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Excluir categoria"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
