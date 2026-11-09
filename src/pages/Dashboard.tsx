import { Button } from "@/components/ui/button"

export default function Dashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Panel de Control</h1>
            <p className="text-muted-foreground mb-8">
                Bienvenido al sistema administrativo de Gym Digital.
            </p>

            <div className="flex gap-4">
                <Button>Nueva Reserva</Button>
                <Button variant="outline">Ver Horarios</Button>
            </div>
        </div>
    )
}