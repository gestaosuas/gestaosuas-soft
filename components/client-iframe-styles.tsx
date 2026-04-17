"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function ClientIframeStyles() {
    const searchParams = useSearchParams()
    const isModal = searchParams?.get('modal') === 'true'

    useEffect(() => {
        // Detect if we are inside an iframe or modal mode
        if (window.self !== window.top || isModal) {
            // Find the container and remove padding for a full-screen experience
            const containers = document.querySelectorAll('.iframe-container')
            containers.forEach((el: any) => {
                el.style.padding = '0'
                el.style.margin = '0'
                el.style.width = '100%'
                el.style.maxWidth = '100%'
            })

            // Also hide any body margin/padding if present
            document.body.style.margin = '0'
            document.body.style.padding = '0'
            document.body.style.overflowX = 'hidden'
            
            // Add a class for global CSS targeting
            document.body.classList.add('is-iframe-mode')
        } else {
            document.body.classList.remove('is-iframe-mode')
        }
    }, [isModal])

    return (
        <style dangerouslySetInnerHTML={{ __html: `
            /* Clean modal navigation */
            .is-iframe-mode .iframe-container { 
                padding: 0 !important; 
                margin: 0 !important;
            }
            
            /* Target back buttons and redundant headers inside iframe */
            .is-iframe-mode a[href^="/dashboard/diretoria"]:not(.keep-header),
            .is-iframe-mode button:has(svg.lucide-arrow-left),
            .is-iframe-mode h1 + div + .flex,
            .is-iframe-mode nav { 
                display: none !important; 
            }

            /* Ensure main content takes full width when sidebar is hidden */
            .is-iframe-mode main {
                padding: 1rem !important; /* Minimal padding for mobile-like feel inside modal */
            }

            @media (min-width: 768px) {
                .is-iframe-mode main {
                    padding: 2rem !important;
                }
            }
        ` }} />
    )
}
