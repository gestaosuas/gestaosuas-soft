'use client'

import { useRouter } from 'next/navigation'

export function ReturnLink({ href, label = "Voltar para Diretoria" }: { href: string, label?: string }) {
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
                padding: '10px 20px',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginTop: '10px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1e3a8a';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
        >
            <span style={{ fontSize: '14px' }}>←</span>
            <span>{label}</span>
        </button>
    )
}
