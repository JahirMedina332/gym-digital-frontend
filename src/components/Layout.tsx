import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Home, Users, Dumbbell, IdCard, CalendarCheck,
    LogOut, LayoutDashboard
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [rol, setRol] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");
        if (token) {
            try {
                // Decodificamos el token para saber qué rol tiene
                const payload = JSON.parse(atob(token.split('.')[1]));
                setRol(payload.rol); // Obtiene "ADMIN", "CLIENTE" o "ENTRENADOR"
            } catch (e) {
                console.error("Error al decodificar token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt_token");
        navigate("/login");
    };

    // 1. Opciones exclusivas para el ADMINISTRADOR
    const adminLinks = [
        { path: "/", label: "Inicio", icon: <Home className="w-5 h-5" /> },
        { path: "/usuarios", label: "Usuarios", icon: <Users className="w-5 h-5" /> },
        { path: "/clases", label: "Clases", icon: <Dumbbell className="w-5 h-5" /> },
        { path: "/membresias", label: "Membresías", icon: <IdCard className="w-5 h-5" /> },
        { path: "/reservas", label: "Reservas", icon: <CalendarCheck className="w-5 h-5" /> },
    ];

    // 2. Opciones exclusivas para el CLIENTE
    const clienteLinks = [
        { path: "/mi-panel", label: "Mi Panel", icon: <LayoutDashboard className="w-5 h-5" /> },
    ];
    // 3. Opciones exclusivas para el ENTRENADOR
    const entrenadorLinks = [
        { path: "/mi-horario", label: "Mi Horario", icon: <CalendarCheck className="w-5 h-5" /> },
    ];

    // Elegimos qué menú mostrar basándonos en el rol
    let links = [];
    if (rol === "ADMIN") {
        links = adminLinks;
    } else if (rol === "ENTRENADOR") {
        links = entrenadorLinks;
    } else {
        links = clienteLinks; // Por defecto o si es CLIENTE
    }


    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar / Menú Lateral */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm">
                <div>
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <span className="text-xl font-black text-blue-600 tracking-tight">Gym Digital</span>
                    </div>

                    {/* Enlaces de Navegación Dinámicos */}
                    <nav className="p-4 space-y-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Botón de Cerrar Sesión (Visible para todos) */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal (Las pantallas que ya creamos) */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}