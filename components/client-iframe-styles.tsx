"use client"

import { useEffect } from "react"

export function ClientIframeStyles() {
    useEffect(() => {
        // Detect if we are inside an iframe
        if (window.self !== window.top) {
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
        }
    }, [])

    return (
        <style dangerouslySetInnerHTML={{ __html: `
            /* Clean modal navigation - hide all back buttons/headers in iframe */
            @media (display-mode: standalone) {
                .iframe-container { padding: 0 !important; }
            }
            
            /* Target back buttons and redundant headers inside iframe */
            body:not(:root) .iframe-container a[href^="/dashboard/diretoria"],
            body:not(:root) .iframe-container button:has(svg.lucide-arrow-left),
            body:not(:root) .iframe-container h1 + div + .flex, /* Typical header layouts */
            body:not(:root) .iframe-container nav { 
                display: none !important; 
            }

            /* Extra safety if JS fails */
            :not(:root):fullscreen .iframe-container { padding: 0 !important; }
        ` }} />
    )
}
