import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/?source=pwa',
        name: 'Gestão SUAS - Vigilância Socioassistencial',
        short_name: 'GestãoSUAS',
        description: 'Sistema de Monitoramento e Avaliação da Rede Socioassistencial',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#1e3a8a',
        theme_color: '#1e3a8a',
        orientation: 'portrait',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/logo-vigilancia.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        shortcuts: [
            {
                name: 'Painel Geral',
                url: '/dashboard',
                icons: [{ src: '/icon.png', sizes: '192x192' }]
            },
            {
                name: 'Modo TV',
                url: '/dashboard/tv',
                icons: [{ src: '/icon.png', sizes: '192x192' }]
            }
        ],
        categories: ['business', 'productivity', 'government'],
    }
}
