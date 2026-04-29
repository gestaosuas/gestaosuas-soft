import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Gestão SUAS - Vigilância Socioassistencial',
        short_name: 'GestãoSUAS',
        description: 'Sistema de Monitoramento e Avaliação da Rede Socioassistencial',
        start_url: '/',
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
    }
}
