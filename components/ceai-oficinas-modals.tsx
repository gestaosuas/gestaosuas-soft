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
import { Users, CheckCircle2, Loader2, Tags, Trash2, Layers, Pencil, XCircle } from "lucide-react"
import { saveCategoria, saveOficina, getCategorias, deleteCategoria, getOficinasComCategorias, deleteOficina, updateOficinaCategoria, updateCategoria, updateOficina } from "./ceai-actions"

export function CEAIOficinasModals({ unit, directorateId }: { unit: string, directorateId: string }) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [isOficinaOpen, setIsOficinaOpen] = useState(false)

    const [categoryName, setCategoryName] = useState("")
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

    // States for Oficina
    const [oficinaName, setOficinaName] = useState("")
    const [oficinaCategoryId, setOficinaCategoryId] = useState("empty")
    const [editingOficinaId, setEditingOficinaId] = useState<string | null>(null)

    const [categories, setCategories] = useState<any[]>([])
    const [oficinas, setOficinas] = useState<any[]>([])
    const [categoryMessage, setCategoryMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
    const [oficinaMessage, setOficinaMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

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
        setEditingOficinaId(null)
        setOficinaName("")
        setOficinaCategoryId("empty")
        setOficinaMessage(null)
        await Promise.all([loadCategories(), loadOficinas()])
    }

    const handleOpenCategory = async (open: boolean) => {
        setIsCategoryOpen(open)
        setEditingCategoryId(null)
        setCategoryName("")
        setCategoryMessage(null)
        if (open) {
            await loadCategories()
        }
    }

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryName) return
        startTransition(async () => {
            let res;
            if (editingCategoryId) {
                res = await updateCategoria(editingCategoryId, categoryName, directorateId)
            } else {
                res = await saveCategoria(unit, categoryName, directorateId)
            }

            if (res.success) {
                setCategoryMessage({ type: 'success', text: editingCategoryId ? 'Categoria atualizada!' : 'Categoria salva!' })
                setCategoryName("")
                setEditingCategoryId(null)
                await loadCategories()
                setTimeout(() => setCategoryMessage(null), 3000)
            } else {
                setCategoryMessage({ type: 'error', text: 'Erro ao processar categoria.' })
            }
        })
    }

    const handleEditCategory = (cat: any) => {
        setEditingCategoryId(cat.id)
        setCategoryName(cat.name)
    }

    const cancelEditCategory = () => {
        setEditingCategoryId(null)
        setCategoryName("")
    }

    const handleDeleteCategory = (id: string) => {
        if (!confirm('Deseja realmente excluir esta categoria?')) return
        startTransition(async () => {
            const res = await deleteCategoria(id, directorateId)
            if (res.success) {
                setCategoryMessage({ type: 'info', text: 'Categoria excluída.' })
                if (editingCategoryId === id) cancelEditCategory()
                await loadCategories()
                setTimeout(() => setCategoryMessage(null), 3000)
            } else {
                setCategoryMessage({ type: 'error', text: 'Erro ao excluir categoria. Verifique se existem oficinas vinculadas a ela.' })
            }
        })
    }

    const handleSaveOficina = (e: React.FormEvent) => {
        e.preventDefault()
        if (!oficinaName) return

        startTransition(async () => {
            let res;
            if (editingOficinaId) {
                res = await updateOficina(editingOficinaId, oficinaName, oficinaCategoryId, directorateId)
            } else {
                res = await saveOficina(unit, oficinaName, oficinaCategoryId, 0, 0, directorateId)
            }

            if (res.success) {
                setOficinaMessage({ type: 'success', text: editingOficinaId ? 'Oficina atualizada!' : 'Oficina salva!' })
                setOficinaName("")
                setOficinaCategoryId("empty")
                setEditingOficinaId(null)
                await loadOficinas()
                setTimeout(() => setOficinaMessage(null), 3000)
            } else {
                setOficinaMessage({ type: 'error', text: 'Erro ao processar oficina.' })
            }
        })
    }

    const handleEditOficina = (ofi: any) => {
        setEditingOficinaId(ofi.id)
        setOficinaName(ofi.activity_name)
        setOficinaCategoryId(ofi.category_id || "empty")
    }

    const cancelEditOficina = () => {
        setEditingOficinaId(null)
        setOficinaName("")
        setOficinaCategoryId("empty")
    }

    const handleDeleteOficina = (id: string) => {
        if (!confirm('Deseja realmente excluir esta oficina?')) return
        startTransition(async () => {
            const res = await deleteOficina(id, directorateId)
            if (res.success) {
                setOficinaMessage({ type: 'info', text: 'Oficina excluída.' })
                if (editingOficinaId === id) cancelEditOficina()
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
                    <button onClick={handleOpenOficina} className="flex items-center justify-center w-full px-2 py-1.5 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-bold text-zinc-600 dark:text-zinc-400 transition-colors uppercase tracking-wider">
                        <Users className="w-3 h-3 mr-1.5 opacity-60" />
                        Oficinas
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Users className="w-5 h-5" /> {editingOficinaId ? 'Editar Oficina' : 'Cadastrar Oficina'} - {unit}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <form onSubmit={handleSaveOficina} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="activity_name" className="text-xs font-bold uppercase text-zinc-500">Nome da Atividade</Label>
                                <Input
                                    id="activity_name"
                                    value={oficinaName}
                                    onChange={(e) => setOficinaName(e.target.value)}
                                    required
                                    placeholder="Ex: Informática Básica"
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id" className="text-xs font-bold uppercase text-zinc-500">Categoria (Tags)</Label>
                                <Select
                                    value={oficinaCategoryId}
                                    onValueChange={setOficinaCategoryId}
                                    disabled={isPending}
                                >
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

                            {oficinaMessage && (
                                <div className={`p-3 text-sm rounded-md ${oficinaMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    oficinaMessage.type === 'info' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {oficinaMessage.text}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50" disabled={isPending}>
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    {isPending ? "Processando..." : editingOficinaId ? "Atualizar Oficina" : "Salvar Oficina"}
                                </button>
                                {editingOficinaId && (
                                    <button
                                        type="button"
                                        onClick={cancelEditOficina}
                                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Oficinas Registradas</Label>
                            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[250px] overflow-y-auto">
                                {oficinas.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-400 italic">
                                        Nenhuma oficina cadastrada
                                    </div>
                                ) : (
                                    oficinas.map(ofi => (
                                        <div key={ofi.id} className={`flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group ${editingOficinaId === ofi.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{ofi.activity_name}</span>
                                                    <Select
                                                        value={ofi.category_id || "empty"}
                                                        onValueChange={(val) => handleCategoryChange(ofi.id, val)}
                                                        disabled={isPending}
                                                    >
                                                        <SelectTrigger className="h-5 text-[9px] py-0 px-1.5 w-auto bg-zinc-100 dark:bg-zinc-800 border-none rounded text-zinc-500 font-medium">
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
                                                <div className="text-[10px] text-zinc-500 italic">
                                                    Vagas e ocupação definidas mensalmente
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditOficina(ofi)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    title="Editar oficina"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOficina(ofi.id)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Excluir oficina"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
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
                    <button className="flex items-center justify-center w-full px-2 py-1.5 text-[10px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md font-bold text-zinc-600 dark:text-zinc-400 transition-colors uppercase tracking-wider">
                        <Tags className="w-3 h-3 mr-1.5 opacity-60" />
                        Categorias
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Tags className="w-5 h-5" /> {editingCategoryId ? 'Editar Categoria' : 'Adicionar Categoria'} - {unit}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_name" className="text-xs font-bold uppercase text-zinc-500">Nome da Categoria</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="category_name"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                        placeholder="Ex: Esportes, Cultura..."
                                        disabled={isPending}
                                        className="h-10"
                                    />
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 ${editingCategoryId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap h-10 flex items-center gap-2`}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCategoryId ? <Pencil className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {editingCategoryId ? 'Atualizar' : 'Adicionar'}
                                    </button>
                                    {editingCategoryId && (
                                        <button
                                            type="button"
                                            onClick={cancelEditCategory}
                                            className="px-3 h-10 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 rounded-md transition-colors"
                                            title="Cancelar edição"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
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
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categorias Existentes</Label>
                            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[200px] overflow-y-auto">
                                {categories.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-400 italic">
                                        Nenhuma categoria cadastrada
                                    </div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className={`flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group ${editingCategoryId === cat.id ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <Tags className="w-3.5 h-3.5 text-blue-500 opacity-60" />
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditCategory(cat)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                    title="Editar categoria"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Excluir categoria"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
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
