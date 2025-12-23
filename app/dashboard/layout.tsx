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
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-zinc-50 dark:selection:bg-zinc-100 dark:selection:text-zinc-900 flex-col md:flex-row print:bg-white print:h-auto print:overflow-visible">
            {/* Elegant Background Layering */}
            <div className="absolute inset-0 -z-10 bg-white dark:bg-zinc-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.03),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.02),rgba(0,0,0,0))] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
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
