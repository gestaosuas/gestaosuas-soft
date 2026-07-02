"use client"

import { useTransition } from "react"
import { createMapCategory, updateMapCategory } from "./actions"
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

interface CategoryFormModalProps {
    isOpen: boolean
    onClose: () => void
    initialData: MapCategory | null
}

export function CategoryFormModal({ isOpen, onClose, initialData }: CategoryFormModalProps) {
    const [isPending, startTransition] = useTransition()
    const isEditing = !!initialData

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            let res
            if (isEditing) {
                res = await updateMapCategory(initialData.id, formData)
            } else {
                res = await createMapCategory(formData)
            }

            if (res.error) {
                alert(res.error)
            } else {
                onClose()
            }
        })
    }

    // Sugestões de cores nativas do Leaflet custom markers
    const suggestedColors = [
        { name: 'Azul', value: 'blue' },
        { name: 'Ouro', value: 'gold' },
        { name: 'Vermelho', value: 'red' },
        { name: 'Verde', value: 'green' },
        { name: 'Laranja', value: 'orange' },
        { name: 'Amarelo', value: 'yellow' },
        { name: 'Violeta', value: 'violet' },
        { name: 'Cinza', value: 'grey' },
        { name: 'Preto', value: 'black' }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                    <DialogDescription>
                        Crie uma categoria para agrupar as unidades no mapa.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Categoria</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={initialData?.name || ''}
                                placeholder="Ex: CRAS"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Cor do Marcador</Label>
                            <select
                                id="color"
                                name="color"
                                defaultValue={initialData?.color || 'blue'}
                                className="w-full h-10 px-3 flex items-center rounded-md border border-zinc-200 bg-white text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                                required
                            >
                                {suggestedColors.map(c => (
                                    <option key={c.value} value={c.value}>{c.name} ({c.value})</option>
                                ))}
                            </select>
                            <p className="text-[12px] text-zinc-500 mt-1">
                                Selecione uma cor pré-definida para o pino no mapa.
                            </p>
                        </div>
                    </div>

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
                            {isEditing ? 'Salvar' : 'Criar Categoria'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
