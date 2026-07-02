'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function NavControl({ href, label = "Voltar para Diretoria" }: { href: string, label?: string }) {
    const router = useRouter()

    return (
        <button
            type="button"
            onClick={() => router.push(href)}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: '#ffffff', 
                color: '#1e3a8a', 
                border: '1px solid #e2e8f0', 
                borderRadius: '9999px', 
                padding: '8px 16px', 
                fontSize: '10px', 
                fontWeight: 'bold', 
                textTransform: 'uppercase', 
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                marginBottom: '10px'
            }}
        >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            <span>{label}</span>
        </button>
    )
}
