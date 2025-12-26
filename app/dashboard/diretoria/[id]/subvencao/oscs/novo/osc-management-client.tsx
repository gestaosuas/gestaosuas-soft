'use client'

import { useState } from "react"
import { FormOSC } from "./form-osc"
import { OSCList } from "./osc-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function OSCManagementClient({ directorateId, initialOscs }: { directorateId: string, initialOscs: any[] }) {
    const [oscToEdit, setOscToEdit] = useState<any | null>(null)
    const [showForm, setShowForm] = useState(false)

    const handleEdit = (osc: any) => {
        setOscToEdit(osc)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setOscToEdit(null)
        setShowForm(false)
    }

    return (
        <div className="container mx-auto py-8 space-y-8 min-h-screen">
            {showForm ? (
                <FormOSC
                    directorateId={directorateId}
                    oscToEdit={oscToEdit}
                    onCancelEdit={handleCloseForm}
                    existingOscs={initialOscs}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-blue-900 dark:text-blue-50 tracking-tight">OSCs PARCEIRAS</h1>
                            <p className="text-zinc-500 font-medium">Gerenciamento de Organizações da Sociedade Civil</p>
                        </div>
                        <Button
                            onClick={() => setShowForm(true)}
                            className="h-12 px-8 rounded-2xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-black font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/20 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Cadastrar Nova OSC
                        </Button>
                    </div>

                    <OSCList
                        oscs={initialOscs}
                        onEdit={handleEdit}
                    />
                </div>
            )}
        </div>
    )
}
