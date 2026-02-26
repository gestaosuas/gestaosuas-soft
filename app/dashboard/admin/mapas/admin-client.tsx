"use client"

import { useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, MapPin, Palette } from "lucide-react"
import { UnitFormModal } from "./unit-form-modal"
import { CategoryFormModal } from "./category-form-modal"
import { deleteMapUnit, deleteMapCategory } from "./actions"

interface MapCategory {
    id: string
    name: string
    color: string
}

interface MapUnit {
    id: string
    name: string
    category_id: string | null
    region: string | null
    address: string | null
    phone: string | null
    latitude: number
    longitude: number
    map_categories: MapCategory | null
}

interface MapAdminClientProps {
    initialUnits: MapUnit[]
    initialCategories: MapCategory[]
}

export function MapAdminClient({ initialUnits, initialCategories }: MapAdminClientProps) {
    const [units] = useState<MapUnit[]>(initialUnits)
    const [categories] = useState<MapCategory[]>(initialCategories)

    // Modals state
    const [unitModalOpen, setUnitModalOpen] = useState(false)
    const [categoryModalOpen, setCategoryModalOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<MapUnit | null>(null)
    const [editingCategory, setEditingCategory] = useState<MapCategory | null>(null)

    const [isPending, startTransition] = useTransition()

    const handleCreateUnit = () => {
        setEditingUnit(null)
        setUnitModalOpen(true)
    }

    const handleEditUnit = (unit: MapUnit) => {
        setEditingUnit(unit)
        setUnitModalOpen(true)
    }

    const handleDeleteUnit = (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta unidade?')) return

        startTransition(async () => {
            const res = await deleteMapUnit(id)
            if (res.error) {
                alert(res.error)
            }
        })
    }

    const handleCreateCategory = () => {
        setEditingCategory(null)
        setCategoryModalOpen(true)
    }

    const handleEditCategory = (category: MapCategory) => {
        setEditingCategory(category)
        setCategoryModalOpen(true)
    }

    const handleDeleteCategory = (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria? As unidades não podem estar usando ela.')) return

        startTransition(async () => {
            const res = await deleteMapCategory(id)
            if (res.error) {
                alert(res.error)
            }
        })
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="unidades" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                    <TabsTrigger value="unidades" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Unidades</span>
                    </TabsTrigger>
                    <TabsTrigger value="categorias" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span>Categorias (Cores)</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unidades" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleCreateUnit} className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Unidade
                        </Button>
                    </div>

                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                        <div className="overflow-x-auto rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/60">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Categoria</th>
                                        <th className="px-6 py-4">Região</th>
                                        <th className="px-6 py-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                    {units.map((unit) => (
                                        <tr key={unit.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{unit.name}</td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: unit.map_categories?.color || 'gray' }}></span>
                                                    {unit.map_categories?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{unit.region || '-'}</td>
                                            <td className="px-6 py-4 flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onClick={() => handleEditUnit(unit)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    disabled={isPending}
                                                    onClick={() => handleDeleteUnit(unit.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {units.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                                Nenhuma unidade cadastrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="categorias" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleCreateCategory} className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Categoria
                        </Button>
                    </div>

                    <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                        <div className="overflow-x-auto rounded-xl">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/60">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Cor (ID na Web)</th>
                                        <th className="px-6 py-4 text-center w-24">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{cat.name}</td>
                                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-5 h-5 rounded-full border border-zinc-200 shadow-inner"
                                                        style={{ backgroundColor: cat.color }}
                                                    ></div>
                                                    <span className="font-mono text-xs">{cat.color}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onClick={() => handleEditCategory(cat)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    disabled={isPending}
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                                                Nenhuma categoria cadastrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals are rendered conditionally to prevent DOM bloat */}
            {unitModalOpen && (
                <UnitFormModal
                    isOpen={unitModalOpen}
                    onClose={() => setUnitModalOpen(false)}
                    initialData={editingUnit}
                    categories={categories}
                />
            )}

            {categoryModalOpen && (
                <CategoryFormModal
                    isOpen={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    initialData={editingCategory}
                />
            )}
        </div>
    )
}
