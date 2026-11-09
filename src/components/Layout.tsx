// En React usamos "useState" para guardar el estado de la interfaz (ej: ¿el menú está abierto o cerrado?)
import { useState } from "react"
// Importamos los íconos de la librería Lucide (que instalamos al principio)
import { Menu, Home, Calendar, Dumbbell } from "lucide-react"
// Importamos los componentes de diseño de shadcn
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"


export default function Layout({ children }: { children: React.ReactNode }) {
    // Esta variable controla si el menú de celular está visible (true) u oculto (false)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-background text-foreground">

            {/* 1. SIDEBAR PARA ESCRITORIO */}
            {/* "hidden md:flex" es la magia responsiva de Tailwind:
          Significa "ocúltalo por defecto (celulares), pero muéstralo si la pantalla es mediana o grande (md)". */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-4">
                <h2 className="text-2xl font-bold mb-8">Gym Digital</h2>

                <nav className="flex flex-col gap-2">
                    {/* Los íconos en React se usan como si fueran etiquetas HTML */}
                    <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors">
                        <Home className="w-5 h-5" /> Inicio
                    </a>
                    <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors">
                        <Dumbbell className="w-5 h-5" /> Clases
                    </a>
                    <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors">
                        <Calendar className="w-5 h-5" /> Reservas
                    </a>
                </nav>
            </aside>

            {/* 2. CONTENIDO PRINCIPAL */}
            <main className="flex-1 flex flex-col">

                {/* 3. BARRA SUPERIOR PARA CELULARES */}
                {/* "md:hidden" significa "ocúltalo en pantallas grandes", por lo que solo se ve en celulares */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
                    <h2 className="text-xl font-bold">Gym Digital</h2>

                    {/* Este es el componente que desliza el menú desde la izquierda */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        {/* Quitamos asChild y le damos los estilos de botón directamente al SheetTrigger */}
                        <SheetTrigger className="inline-flex items-center justify-center rounded-md border border-border p-2 hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Menu className="w-5 h-5" />
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-4">
                            <SheetTitle className="text-2xl font-bold mb-8">Gym Digital</SheetTitle>
                            <nav className="flex flex-col gap-2">
                                {/* Al hacer clic en un enlace, cambiamos el estado a "false" para que el menú se cierre solo */}
                                <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
                                    <Home className="w-5 h-5" /> Inicio
                                </a>
                                <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
                                    <Dumbbell className="w-5 h-5" /> Clases
                                </a>
                                <a href="#" className="flex items-center gap-3 p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
                                    <Calendar className="w-5 h-5" /> Reservas
                                </a>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>

                {/* 4. AQUÍ ENTRA EL CONTENIDO DINÁMICO DE App.tsx */}
                <div className="p-8">
                    {children}
                </div>
            </main>

        </div>
    )
}