'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function ClientNavigateButton({ href, label }: { href: string, label: string }) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.push(href)}
            style={{
                height: '56px',
                paddingLeft: '32px',
                paddingRight: '32px',
                borderRadius: '16px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.25)'
            }}
        >
            <Plus style={{ height: '20px', width: '20px' }} />
            {label}
        </button>
    )
}
