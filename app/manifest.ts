import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sistema Vigilância Socioassistencial',
        short_name: 'Vigilância',
        description: 'Sistema de Monitoramento e Avaliação da Rede Socioassistencial',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e3a8a',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-vigilancia.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
