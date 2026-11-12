import { Users, Dumbbell, IdCard, CalendarCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Dashboard() {
    const navigate = useNavigate()

    const [dashboardData, setDashboardData] = useState({
        usuariosActivos: 0,
        clasesTotales: 0,
        membresiasActivas: 0,
        reservasTotales: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("jwt_token")

            try {
                const response = await fetch("http://localhost:9525/api/dashboard/stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setDashboardData(data)
                } else if (response.status === 403 || response.status === 401) {
                    localStorage.removeItem("jwt_token")
                    navigate("/login")
                }
            } catch (error) {
                console.error("Error conectando con el backend:", error)
            }
        }

        fetchStats()
    }, [navigate])

    const stats = [
        { title: "Usuarios Registrados", value: dashboardData.usuariosActivos.toString(), icon: Users, color: "text-blue-500" },
        { title: "Clases Programadas", value: dashboardData.clasesTotales.toString(), icon: Dumbbell, color: "text-orange-500" },
        { title: "Membresías Emitidas", value: dashboardData.membresiasActivas.toString(), icon: IdCard, color: "text-emerald-500" },
        { title: "Reservas Realizadas", value: dashboardData.reservasTotales.toString(), icon: CalendarCheck, color: "text-purple-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
                <p className="text-gray-500 mt-1">
                    Resumen general de la base de datos de Gym Digital.
                </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between pb-4">
                                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}