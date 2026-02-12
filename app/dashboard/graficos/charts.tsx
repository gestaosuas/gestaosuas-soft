"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricsCards({ data, monthName, compact = false }: { data: any[], monthName: string, compact?: boolean }) {
    const colSpan = data.length === 5 ? 'xl:grid-cols-5' : data.length >= 4 ? 'lg:grid-cols-4' : `grid-cols-${data.length}`;

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${colSpan} gap-4`}>
            {data.map((item: any, i: number) => {
                const isPositive = (item.trend || 0) >= 0;

                return (
                    <Card key={i} className="rounded-[2rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden group">
                        <CardHeader className="p-6 pb-2">
                            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] leading-tight">
                                {item.label}
                            </h3>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-3xl font-black tracking-tight text-slate-800 dark:text-white" style={{ color: item.color ? item.color : undefined }}>
                                    {item.value.toLocaleString('pt-BR')}
                                </div>
                                {item.trend !== undefined && (
                                    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <span className="flex items-center">
                                            {isPositive ? '↗' : '↘'} {Math.abs(item.trend)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {item.history && (
                                <div className="w-[80px] h-[40px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={item.history}>
                                            <defs>
                                                <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={item.color || '#3b82f6'} stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor={item.color || '#3b82f6'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke={item.color || '#3b82f6'}
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill={`url(#gradient-${i})`}
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

export function ServicesBarChart({ data }: { data: any[] }) {
    return (
        <Card className="rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Serviços Prestados
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
                        barGap={12}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={140}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[0, 10, 10, 0]}
                            barSize={24}
                            label={{ position: 'right', fill: '#64748b', fontSize: 11, fontWeight: '800', dx: 10, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function AttendanceLineChart({ data }: { data: any[] }) {
    return (
        <Card className="rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <CardHeader className="p-8 pb-4">
                <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                    Atendimento ao Empregador e Trabalhador
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-8 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTrabalhador" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEmpregador" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={15}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                            hide
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px', color: '#64748b' }} />

                        <Area
                            type="monotone"
                            dataKey="trabalhador"
                            name="Trabalhador"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTrabalhador)"
                            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            label={{ position: 'top', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold', dy: -10, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="empregador"
                            name="Empregador"
                            stroke="#0f172a"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEmpregador)"
                            dot={{ r: 3, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
                            label={{ position: 'top', fill: '#0f172a', fontSize: 10, fontWeight: 'bold', dy: -10, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function GenericLineChart({ data, title, dataKey, color, subtitle }: { data: any[], title: string, dataKey: string, color: string, subtitle?: string }) {
    return (
        <Card className="rounded-[2.5rem] border-zinc-100/80 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    <CardTitle className="text-[11px] font-black text-slate-800 dark:text-zinc-300 uppercase tracking-widest leading-tight">
                        {title}
                    </CardTitle>
                </div>
                {subtitle && (
                    <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tight">{subtitle}</span>
                )}
            </CardHeader>
            <CardContent className="h-[300px] p-8 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={15}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            hide
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color-${dataKey})`}
                            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                            label={{ position: 'top', fill: color, fontSize: 10, fontWeight: 'bold', dy: -10, formatter: (val: any) => Number(val) > 0 ? val.toLocaleString('pt-BR') : '' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export function ComparisonLineChart({ data, title, keys, colors }: { data: any[], title: string, keys: string[], colors: string[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="p-3">
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] p-2 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        {keys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index]}
                                strokeWidth={3}
                                dot={{ r: 4, fill: colors[index], strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                                label={{ position: 'top', fill: colors[index], fontSize: 10, dy: -5, formatter: (val: any) => Number(val) > 0 ? val : '' }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}


const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[12px] font-bold"
        >
            {value}
        </text>
    );
};

export function GenderPieChart({ data }: { data: any[] }) {
    const COLORS = ['#3b82f6', '#f43f5e']; // Blue for Men, Rose for Women

    return (
        <Card className="shadow-sm">
            <CardHeader className="p-3">
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Gênero
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[220px] p-2 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any, props: any) => [`${value}`, name]}
                        />
                        <Legend
                            verticalAlign="middle"
                            layout="vertical"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry: any) => <span className="text-zinc-600 dark:text-zinc-400 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {data.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
            </CardContent>
        </Card>
    )
}

export function GenericPieChart({ data, title, colors }: { data: any[], title: string, colors?: string[] }) {
    // Default colors if not provided
    const DEFAULT_COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
    const COLORS = colors || DEFAULT_COLORS;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any, name: any, props: any) => [`${value}`, name]}
                        />
                        <Legend
                            verticalAlign="middle"
                            layout="vertical"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px' }}
                            formatter={(value, entry: any) => <span className="text-zinc-600 dark:text-zinc-400 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {data.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>}
            </CardContent>
        </Card>
    )
}
