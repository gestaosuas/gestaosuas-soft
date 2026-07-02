'use client'

import { useRouter } from 'next/navigation'

export function ReturnLink({ href }: { href: string }) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.push(href)}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                border: '1px solid #e2e8f0',
                borderRadius: '99px',
                padding: '8px 16px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
        >
            <span style={{ fontSize: '14px' }}>←</span>
            <span>Voltar para Diretoria</span>
        </button>
    )
}
