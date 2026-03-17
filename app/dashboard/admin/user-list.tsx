'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Shield, Check, X, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteUser, updateUserAccount } from './actions'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


type UserData = {
    id: string
    email: string
    name: string
    role: string
    primaryDirectorateId?: string | null
    directorateAccess: { id: string, allowed_units: string[] | null }[] // IDs and their allowed units.
}

type Directorate = {
    id: string
    name: string
    available_units?: string[] | null
}

export function UserList({ users, directorates }: { users: UserData[], directorates: Directorate[] }) {
    const [editingUser, setEditingUser] = useState<UserData | null>(null)
    const [selectedDirs, setSelectedDirs] = useState<{ id: string, allowed_units: string[] | null }[]>([])
    const [selectedRole, setSelectedRole] = useState<string>('agente')
    const [primaryDirId, setPrimaryDirId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [newPassword, setNewPassword] = useState('')

    const handleDelete = async (userId: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return

        setIsDeleting(userId)
        try {
            await deleteUser(userId)
        } catch (e: any) {
            alert("Erro ao excluir usuário: " + (e.message || "Erro desconhecido"))
        } finally {
            setIsDeleting(userId === isDeleting ? null : isDeleting)
        }
    }

    const handleEditClick = (user: UserData) => {
        setEditingUser(user)
        setNewPassword('') 
        setSelectedRole(user.role || 'agente')
        setPrimaryDirId(user.primaryDirectorateId || null)
        setSelectedDirs(user.directorateAccess ? user.directorateAccess.map(da => ({
            ...da,
            allowed_units: da.allowed_units === null ? null : [...(da.allowed_units || [])]
        })) : [])
    }

    const handleSavePermissions = async () => {
        if (!editingUser) return
        
        if ((selectedRole === 'diretor' || selectedRole === 'agente') && !primaryDirId) {
            alert("Usuários Diretores e Agentes precisam de uma Diretoria Primária.")
            return
        }

        setIsSaving(true)
        try {
            await updateUserAccount(editingUser.id, {
                password: newPassword,
                role: selectedRole,
                primaryDirectorateId: primaryDirId,
                directorates: selectedDirs
            })
            setEditingUser(null)
            setNewPassword('')
        } catch (e: any) {
            alert(e.message || "Erro ao atualizar usuário")
        } finally {
            setIsSaving(false)
        }
    }

    const toggleDir = (dirId: string) => {
        if (selectedDirs.some(d => d.id === dirId)) {
            setSelectedDirs(selectedDirs.filter(d => d.id !== dirId))
        } else {
            setSelectedDirs([...selectedDirs, { id: dirId, allowed_units: null }])
        }
    }

    const toggleUnit = (dirId: string, unit: string) => {
        setSelectedDirs(prev => prev.map(d => {
            if (d.id === dirId) {
                const currentUnits = d.allowed_units || [];
                const hasUnit = currentUnits.includes(unit)
                return {
                    ...d,
                    allowed_units: hasUnit
                        ? currentUnits.filter(u => u !== unit)
                        : [...currentUnits, unit]
                }
            }
            return d
        }))
    }

    return (
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none rounded-2xl overflow-hidden mt-12 mb-20">
            <CardHeader className="pt-10 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Membros da Equipe</CardTitle>
                    <CardDescription className="text-sm font-medium text-zinc-500">Listagem de acessos vinculados ao sistema.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] font-bold bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/60">
                            <tr>
                                <th className="px-8 py-5">Identificação</th>
                                <th className="px-8 py-5">E-mail Corporativo</th>
                                <th className="px-8 py-5">Nível de Acesso</th>
                                <th className="px-8 py-5">Diretoria Primária</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                                    </td>
                                    <td className="px-8 py-6 text-zinc-500 dark:text-zinc-400 font-medium">
                                        {user.email}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                user.role === 'admin' ? "bg-blue-600 dark:bg-blue-400" :
                                                user.role === 'diretor' ? "bg-emerald-600 dark:bg-emerald-400" :
                                                "bg-zinc-300 dark:bg-zinc-700"
                                            )}></div>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                user.role === 'admin' ? "text-blue-900 dark:text-blue-400" :
                                                user.role === 'diretor' ? "text-emerald-900 dark:text-emerald-400" :
                                                "text-zinc-500 dark:text-zinc-400"
                                            )}>
                                                {user.role === 'admin' ? 'Administrador' : 
                                                 user.role === 'diretor' ? 'Diretor' : 
                                                 user.role === 'agente' ? 'Agente' : 'Usuário'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-medium text-zinc-600 dark:text-zinc-400 text-xs">
                                        {user.primaryDirectorateId ? (
                                            directorates.find(d => d.id === user.primaryDirectorateId)?.name || 'Desconhecida'
                                        ) : (
                                            <span className="text-zinc-300 italic">Nenhuma</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-900 dark:hover:text-blue-100 transition-all rounded-lg"
                                                onClick={() => handleEditClick(user)}
                                                disabled={isDeleting === user.id}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-lg"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isDeleting === user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-3xl bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none p-0 overflow-hidden gap-0">
                    <DialogHeader className="pt-10 px-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 z-10">
                        <DialogTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Configurações de Membro</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500">
                            Gerencie as credenciais e o escopo de atuação de <span className="text-blue-900 dark:text-blue-100 font-bold">{editingUser?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-zinc-50/30 dark:bg-zinc-950/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Role Selection */}
                            <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserCog className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Nível de Acesso</h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {['admin', 'diretor', 'agente'].map((r) => (
                                        <label key={r} className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                            selectedRole === r 
                                                ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                        )}>
                                            <input 
                                                type="radio" 
                                                name="role" 
                                                value={r} 
                                                checked={selectedRole === r}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="hidden" 
                                            />
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                selectedRole === r ? "border-blue-900 dark:border-blue-400" : "border-zinc-300 dark:border-zinc-700"
                                            )}>
                                                {selectedRole === r && <div className="w-2 h-2 rounded-full bg-blue-900 dark:bg-blue-400" />}
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">
                                                {r === 'admin' ? 'Administrador' : r === 'diretor' ? 'Diretor' : 'Agente'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Primary Directorate Selection */}
                            <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Diretoria Primária</h3>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] text-zinc-500 italic leading-snug">Necessário para Diretores e Agentes para definir seu departamento de origem.</p>
                                    <select 
                                        className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-900 dark:bg-zinc-950 dark:border-zinc-800 font-bold text-blue-900 dark:text-blue-400"
                                        value={primaryDirId || ''}
                                        onChange={(e) => setPrimaryDirId(e.target.value || null)}
                                    >
                                        <option value="">Nenhuma</option>
                                        {directorates.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-zinc-400" />
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Redefinir Senha</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <input
                                    type="password"
                                    placeholder="Nova senha (mínimo 6 caracteres)"
                                    className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-sm focus:ring-2 focus:ring-blue-900 dark:bg-zinc-950 dark:border-zinc-800 font-mono"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <p className="text-[10px] text-zinc-400 italic">Deixe em branco para manter a senha atual.</p>
                            </div>
                        </div>

                        {/* Many-to-Many Access (Secondary/Visibility only) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Escopo de Visibilidade Adicional</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {directorates.map(dir => {
                                    const isSelected = selectedDirs.some(d => d.id === dir.id)
                                    const selectedDirData = selectedDirs.find(d => d.id === dir.id)
                                    const hasAllUnits = selectedDirData && selectedDirData.allowed_units === null ? true : false

                                    return (
                                        <div key={dir.id} className={cn(
                                            "flex flex-col p-4 rounded-xl border transition-all select-none group",
                                            isSelected
                                                ? "bg-blue-50/10 dark:bg-blue-900/10 border-blue-900/30 dark:border-blue-600/30 shadow-sm"
                                                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/60 hover:border-blue-300 dark:hover:border-blue-700"
                                        )}>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleDir(dir.id)}
                                                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 opacity-0 absolute"
                                                    />
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-blue-900 dark:bg-blue-600 border-transparent shadow-inner"
                                                            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-400"
                                                    )}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-[13px] font-bold uppercase tracking-tight transition-colors leading-tight",
                                                    isSelected
                                                        ? "text-blue-900 dark:text-blue-100"
                                                        : "text-zinc-500 dark:text-zinc-400 group-hover:text-blue-900 dark:group-hover:text-blue-200"
                                                )}>
                                                    {dir.name}
                                                </span>
                                            </label>

                                            {isSelected && dir.available_units && dir.available_units.length > 0 && (
                                                <div className="mt-4 pl-8 grid grid-cols-1 gap-2 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-4">
                                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors">
                                                        <div className="flex items-center h-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={hasAllUnits}
                                                                onChange={() => {
                                                                    if (hasAllUnits) {
                                                                        setSelectedDirs(prev => prev.map(d => d.id === dir.id ? { ...d, allowed_units: Array.isArray(dir.available_units) ? [...dir.available_units] : [] } : d))
                                                                    } else {
                                                                        setSelectedDirs(prev => prev.map(d => d.id === dir.id ? { ...d, allowed_units: null } : d))
                                                                    }
                                                                }}
                                                                className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 opacity-0 absolute"
                                                            />
                                                            <div className={cn(
                                                                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                                hasAllUnits
                                                                    ? "bg-blue-600 border-transparent"
                                                                    : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                            )}>
                                                                {hasAllUnits && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                                            </div>
                                                        </div>
                                                        <span className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300">Todas</span>
                                                    </label>

                                                    {!hasAllUnits && Array.isArray(dir.available_units) && dir.available_units.map(unit => {
                                                        const isUnitSelected = selectedDirData && Array.isArray(selectedDirData.allowed_units) ? selectedDirData.allowed_units.includes(unit) : false
                                                        return (
                                                            <label key={unit} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 p-1.5 rounded-lg transition-colors">
                                                                <div className="flex items-center h-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isUnitSelected}
                                                                        onChange={() => toggleUnit(dir.id, unit)}
                                                                        className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-800 opacity-0 absolute"
                                                                    />
                                                                    <div className={cn(
                                                                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                                        isUnitSelected
                                                                            ? "bg-blue-600 border-transparent"
                                                                            : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                                    )}>
                                                                        {isUnitSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                                                    </div>
                                                                </div>
                                                                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{unit}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 z-10 gap-2">
                        <Button variant="ghost" onClick={() => setEditingUser(null)} disabled={isSaving} className="font-bold text-[11px] uppercase tracking-widest text-zinc-500 hover:text-blue-900 hover:bg-zinc-50">Cancelar</Button>
                        <Button onClick={handleSavePermissions} disabled={isSaving} className="bg-blue-900 dark:bg-blue-600 text-white font-bold px-8 rounded-lg text-[11px] uppercase tracking-widest h-11 transition-all shadow-lg shadow-blue-900/10 hover:bg-blue-800">
                            {isSaving ? "Processando..." : "Salvar Configurações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card >
    )
}
