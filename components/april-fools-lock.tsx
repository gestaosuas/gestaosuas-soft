'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, HardDrive, ShieldAlert, Cpu, Terminal } from 'lucide-react'

export function AprilFoolsLock() {
    const [timeLeft, setTimeLeft] = useState(40)
    const [showButton, setShowButton] = useState(false)
    const [revealed, setRevealed] = useState(false)

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setShowButton(true)
        }
    }, [timeLeft])

    if (revealed) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                <div className="text-8xl mb-8">🤡</div>
                <h1 className="text-5xl font-black text-zinc-900 mb-4 tracking-tighter uppercase italic">PEGADINHA!</h1>
                <h2 className="text-3xl font-black text-blue-600 mb-4 uppercase">1º de Abril!</h2>
                <p className="text-xl font-bold text-zinc-500 mb-12 italic max-w-md">O banco de dados está seguro. Você caiu nessa direitinho!</p>
                
                <button 
                   onClick={() => {
                        // Salvar no localStorage que este usuário já viu a pegadinha para não irritar
                        localStorage.setItem('april_fools_2026_v2', 'true')
                        window.location.reload()
                   }}
                   className="px-12 py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase text-sm tracking-widest hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-zinc-500/20"
                >
                    Ufa! Voltar ao Trabalho
                </button>
            </div>
        )
    }

    // Se já foi revelado nesta sessão, não mostra mais
    const isAlreadyRevealed = typeof window !== 'undefined' && localStorage.getItem('april_fools_2026_v2') === 'true'
    if (isAlreadyRevealed) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-zinc-950 text-zinc-300 font-mono flex flex-col items-center justify-center p-8 select-none overflow-hidden">
            <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-1000">
                
                <div className="flex items-center gap-5 text-red-500 mb-2">
                    <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 animate-pulse">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">CRITICAL FAILURE</h1>
                        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">INSTANCE_PURGE_EXECUTED</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800/60 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    {/* Fake Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-10 w-full -translate-y-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>

                    <div className="flex items-center justify-between text-zinc-500 text-[10px] border-b border-zinc-800/60 pb-4">
                        <div className="flex items-center gap-3">
                            <HardDrive className="w-4 h-4" />
                            <span className="uppercase tracking-[0.25em] font-black">Storage: PURGED (0B available)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                            <span className="uppercase font-black text-red-500/80">Disconnected</span>
                        </div>
                    </div>

                    <div className="space-y-5 text-sm leading-relaxed">
                        <p className="text-white font-bold text-lg leading-tight uppercase tracking-tight">
                            Atenção Administrador: Sua instância do banco de dados foi <span className="text-red-500 underline decoration-2 underline-offset-4">deletada permanentemente</span>.
                        </p>
                        <div className="bg-red-500/5 border-l-4 border-red-500 p-4 rounded-r-xl">
                            <p className="text-zinc-400 text-xs">
                                Motivo: Viocação dos termos de serviço - Falta de pagamento da licença corporativa (Plano Free excedido). 
                                De acordo com a cláusula 9.4, todos os dados em instâncias inadimplentes são purgados após 30 dias de aviso prévio.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                                <span className="block text-[9px] font-black text-zinc-600 uppercase mb-1">Data Retention</span>
                                <span className="text-xs font-bold text-red-400">EXPIRED</span>
                            </div>
                            <div className="p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                                <span className="block text-[9px] font-black text-zinc-600 uppercase mb-1">Backups</span>
                                <span className="text-xs font-bold text-red-400">DELETED</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-6 opacity-40">
                         <div className="flex-1 flex flex-col gap-1.5">
                             <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-red-600 w-full"></div>
                             </div>
                             <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest italic">Progress: COMPLETELY WIPED</span>
                         </div>
                         <Cpu className="w-5 h-5 text-zinc-800" />
                    </div>
                </div>

                <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] text-center pt-4">
                    Tentando reconectar aos clusters de backup... FALHA (Timeout 404)
                </div>

                <div className="h-20 flex items-center justify-center">
                    {showButton ? (
                        <div className="flex flex-col items-center gap-6 animate-in zoom-in slide-in-from-bottom-4 duration-1000">
                            <button 
                                onClick={() => setRevealed(true)}
                                className="group relative flex items-center gap-4 bg-white text-zinc-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] border-none"
                            >
                                <ShieldAlert className="w-5 h-5 animate-bounce" />
                                Contatar Suporte de Emergência
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-red-500/40 animate-pulse">
                            <Terminal className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Aguardando resposta do servidor de faturamento... ({timeLeft}s)</span>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(800%); }
                }
            `}</style>

            {/* Background noise effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    )
}
