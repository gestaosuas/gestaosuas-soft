import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { getCachedProfile, getCachedDirectorates, getSystemSettings } from "@/app/dashboard/cached-data"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const profile = await getCachedProfile(user.id)
    const directorates = await getCachedDirectorates()
    const settings = await getSystemSettings()

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617] font-sans antialiased text-zinc-100 selection:bg-cyan-500 selection:text-white flex-col md:flex-row print:bg-white print:h-auto print:overflow-visible">
            {/* Elegant Background Layering - Futuristic Theme */}
            <div className="absolute inset-0 -z-10 bg-[#020617]">
                {/* Primary Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(6,182,212,0.15),rgba(0,0,0,0))] pointer-events-none"></div>
                {/* Secondary Bottom Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(120,119,198,0.08),rgba(0,0,0,0))] pointer-events-none"></div>
                {/* Grain Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            </div>

            <div className="print:hidden">
                <MobileNav
                    role={profile?.role as 'admin' | 'user'}
                    directorates={profile?.role === 'admin' ? directorates || [] : profile?.directorates || []}
                    logoUrl={settings?.logo_url}
                />
            </div>
            <Sidebar
                role={profile?.role as 'admin' | 'user'}
                directorates={profile?.role === 'admin' ? directorates || [] : profile?.directorates || []}
                userName={profile?.full_name || user.email}
                logoUrl={settings?.logo_url}
                systemName={settings?.system_name}
            />
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="h-full p-6 md:p-8 lg:p-10 w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </div>
            </main>
        </div>
    )
}
