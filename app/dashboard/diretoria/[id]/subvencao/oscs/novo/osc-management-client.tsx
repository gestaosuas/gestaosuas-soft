'use client'

import { useState } from "react"
import { FormOSC } from "./form-osc"
import { OSCList } from "./osc-list"

export function OSCManagementClient({ directorateId, initialOscs }: { directorateId: string, initialOscs: any[] }) {
    const [oscToEdit, setOscToEdit] = useState<any | null>(null)

    return (
        <div className="container mx-auto py-8 space-y-16">
            <FormOSC
                directorateId={directorateId}
                oscToEdit={oscToEdit}
                onCancelEdit={() => setOscToEdit(null)}
            />

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-zinc-200/60 dark:border-zinc-800"></div>
                </div>
            </div>

            <OSCList
                oscs={initialOscs}
                onEdit={(osc) => setOscToEdit(osc)}
            />
        </div>
    )
}
