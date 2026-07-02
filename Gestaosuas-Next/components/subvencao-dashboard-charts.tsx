"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid 
} from 'recharts'

interface SubvencaoChartsProps {
    stats: {
        totalOSCs: number
        totalVisits: number
        finalizedVisits: number
        draftReports: number
        finalizedReports: number
    }
}

export function SubvencaoDashboardCharts({ stats }: SubvencaoChartsProps) {
    const visitData = [
        { name: 'Finalizadas', value: stats.finalizedVisits, color: '#16a34a' },
        { name: 'Rascunhos', value: stats.totalVisits - stats.finalizedVisits, color: '#f59e0b' }
    ].filter(item => item.value > 0)

    const reportData = [
        { name: 'Finalizados', value: stats.finalizedReports, color: '#2563eb' },
        { name: 'Rascunhos', value: stats.draftReports, color: '#6366f1' }
    ].filter(item => item.value > 0)

    // Data for a comparison bar chart
    const comparisonData = [
        {
            name: 'Visitas',
            Total: stats.totalVisits,
            Finalizadas: stats.finalizedVisits,
        },
        {
            name: 'Relatórios',
            Total: stats.totalVisits, // Assuming every visit should have a report
            Finalizados: stats.finalizedReports,
        }
    ]

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{payload[0].name}</p>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100 italic">
                        {payload[0].value} {payload[0].value === 1 ? 'Unidade' : 'Unidades'}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
            {/* Chart 1: Status das Visitas */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800 shadow-none bg-white/50 dark:bg-zinc-950/50 rounded-[1.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Visitas</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visitData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={95}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${value}`}
                                labelLine={false}
                            >
                                {visitData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                formatter={(value) => <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 2: Status dos Relatórios */}
            <Card className="border border-zinc-200/60 dark:border-zinc-800 shadow-none bg-white/50 dark:bg-zinc-950/50 rounded-[1.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Relatórios de Visita</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Finalizados', total: stats.finalizedReports, color: '#2563eb' },
                            { name: 'Rascunhos', total: stats.draftReports, color: '#f59e0b' }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40} label={{ position: 'top', fontSize: 12, fontWeight: 'black', fill: '#71717a' }}>
                                {([
                                    { name: 'Finalizados', total: stats.finalizedReports, color: '#2563eb' },
                                    { name: 'Rascunhos', total: stats.draftReports, color: '#f59e0b' }
                                ]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
