// Layout isolado para as rotas de impressão.
// Não herda a sidebar, navbar nem nenhum wrapper do dashboard.
// As páginas de impressão injetam seus próprios estilos inline.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ all: 'unset', display: 'block' }}>
            {children}
        </div>
    )
}
