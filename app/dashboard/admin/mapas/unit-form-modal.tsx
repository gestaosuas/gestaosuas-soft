"use client"

import { useTransition } from "react"
import { createMapUnit, updateMapUnit } from "./actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

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
}

interface UnitFormModalProps {
    isOpen: boolean
    onClose: () => void
    initialData: MapUnit | null
    categories: MapCategory[]
}

export function UnitFormModal({ isOpen, onClose, initialData, categories }: UnitFormModalProps) {
    const [isPending, startTransition] = useTransition()
    const isEditing = !!initialData

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            let res
            if (isEditing) {
                res = await updateMapUnit(initialData.id, formData)
            } else {
                res = await createMapUnit(formData)
            }

            if (res.error) {
                alert(res.error)
            } else {
                onClose()
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Unidade' : 'Nova Unidade do Mapa'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da unidade para ela aparecer no mapa geográfico.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name">Nome da Unidade <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData?.name || ''}
                                placeholder="Ex: CRAS Centro"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category_id">Categoria (Cor) <span className="text-red-500">*</span></Label>
                            <select
                                id="category_id"
                                name="category_id"
                                defaultValue={initialData?.category_id || 'null'}
                                className="w-full h-10 px-3 flex items-center rounded-md border border-zinc-200 bg-white text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                                required
                            >
                                <option value="null" disabled>Selecione uma categoria</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="region">Região</Label>
                            <Input
                                id="region"
                                name="region"
                                defaultValue={initialData?.region || ''}
                                placeholder="Ex: Central"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={initialData?.address || ''}
                                placeholder="Rua, Número, Bairro - CEP"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={initialData?.phone || ''}
                                placeholder="(34) 99999-9999"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude <span className="text-red-500">*</span></Label>
                            <Input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                defaultValue={initialData?.latitude || ''}
                                placeholder="-18.9186"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude <span className="text-red-500">*</span></Label>
                            <Input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                defaultValue={initialData?.longitude || ''}
                                placeholder="-48.2766"
                                required
                            />
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500 italic mt-2">
                        Dica: Você pode conseguir a Latitude e Longitude exata pesquisando o endereço no <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline">Google Maps</a> e clicando com o botão direito sobre o local.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <Button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Salvar Alterações' : 'Cadastrar Unidade'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
