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
                src: '/icon.jpg',
                sizes: '192x192 512x512 1024x1024',
                type: 'image/jpeg',
                purpose: 'maskable',
            },
            {
                src: '/logo-vigilancia.jpg',
                sizes: '192x192 512x512 1024x1024',
                type: 'image/jpeg',
                purpose: 'any',
            },
        ],
        shortcuts: [
            {
                name: 'Painel Geral',
                url: '/dashboard',
                icons: [{ src: '/icon.jpg', sizes: '192x192 512x512', type: 'image/jpeg' }]
            },
            {
                name: 'Modo TV',
                url: '/dashboard/tv',
                icons: [{ src: '/icon.jpg', sizes: '192x192 512x512', type: 'image/jpeg' }]
            }
        ],
        categories: ['business', 'productivity', 'government'],
        screenshots: [
            {
                src: '/screenshots/screenshot1.jpg',
                sizes: '589x945',
                type: 'image/jpeg',
                form_factor: 'narrow',
            },
            {
                src: '/screenshots/screenshot2.jpg',
                sizes: '1910x945',
                type: 'image/jpeg',
                form_factor: 'wide',
            }
        ]
    }
}
