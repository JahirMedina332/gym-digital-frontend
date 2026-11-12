import { useEffect, useState } from "react";
import { Calendar, Clock, Dumbbell, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces basadas en tus DTOs
interface ClaseResponse {
    id: number;
    nombre: string;
    capacidadMaxima: number;
    fechaInicio: string;
    fechaFin: string;
    entrenadorNombre: string;
}

interface ReservaResponse {
    idReserva: number;
    fecha: string;
    estado: string;
    nombreCliente: string;
    nombreClase: string;
}

interface MembresiaResponse {
    id: number;
    usuarioId: number;
    estado: string;
    fechaInicio: string;
    fechaFin: string;
}

export default function DashboardCliente() {
    const [clasesDisponibles, setClasesDisponibles] = useState<ClaseResponse[]>([]);
    const [misReservas, setMisReservas] = useState<ReservaResponse[]>([]);
    const [miMembresia, setMiMembresia] = useState<MembresiaResponse | null>(null);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [usuarioId, setUsuarioId] = useState<number | null>(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        // 1. Extraer datos del JWT sin librerías extra (decodificando Base64)
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            setUsuarioId(decodedPayload.id);
            // Extraemos el nombre del email (ej: Marin@gym.com -> Marin)
            const nombre = decodedPayload.sub.split('@')[0];
            setNombreUsuario(nombre.charAt(0).toUpperCase() + nombre.slice(1));

            cargarDatosCliente(decodedPayload.id);
        } catch (error) {
            console.error("Error al decodificar token:", error);
            navigate("/login");
        }
    }, [navigate, token]);

    const cargarDatosCliente = async (id: number) => {
        try {
            // 2. Ejecutar peticiones en paralelo para mayor velocidad
            const [resClases, resMisReservas, resMembresias] = await Promise.all([
                fetch("http://localhost:9525/api/clase", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`http://localhost:9525/api/reserva/usuario/${id}`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:9525/api/membresias", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (resClases.ok && resMisReservas.ok && resMembresias.ok) {
                const dataClases = await resClases.json();
                const dataReservas = await resMisReservas.json();
                const dataMembresias: MembresiaResponse[] = await resMembresias.json();

                setClasesDisponibles(dataClases);

                // Filtramos solo las reservas que no estén canceladas para mostrar al cliente
                setMisReservas(dataReservas.filter((r: ReservaResponse) => r.estado !== 'CANCELADO'));

                // Buscamos la membresía de este usuario en específico
                const membresiaEncontrada = dataMembresias.find(m => m.usuarioId === id);
                setMiMembresia(membresiaEncontrada || null);
            }
        } catch (error) {
            console.error("Error conectando con el backend:", error);
        }
    };

    const handleReservarClase = async (claseId: number) => {
        if (!miMembresia || miMembresia.estado !== 'ACTIVA') {
            alert("Necesitas una membresía ACTIVA para poder reservar clases.");
            return;
        }

        if (!window.confirm("¿Deseas reservar un cupo para esta clase?")) return;

        const payload = {
            usuario: { id: usuarioId },
            clase: { id: claseId },
            estado: "CONFIRMADA"
        };

        try {
            const response = await fetch("http://localhost:9525/api/reserva", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("¡Reserva confirmada con éxito!");
                if (usuarioId) cargarDatosCliente(usuarioId); // Recargar datos
            } else {
                alert("No se pudo realizar la reserva. Es posible que la clase esté llena o ya tengas un cupo.");
            }
        } catch (error) {
            console.error("Error al reservar:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Saludo */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">¡Hola, {nombreUsuario}!</h1>
                <p className="text-gray-500 mt-1">Este es tu resumen de actividad en el gimnasio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta de Membresía */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Mi Membresía</h2>
                    </div>

                    {miMembresia ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-500 text-sm">Estado</span>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    miMembresia.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                  {miMembresia.estado}
                </span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-500 text-sm">Vencimiento</span>
                                <span className="text-sm font-medium text-gray-900">{miMembresia.fechaFin}</span>
                            </div>
                            {miMembresia.estado !== 'ACTIVA' && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>Tu membresía ha expirado. Por favor, acércate a recepción para renovarla.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No tienes una membresía registrada. Acércate a recepción.</p>
                    )}
                </div>

                {/* Tarjeta de Mis Próximas Clases */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Mis Próximas Clases</h2>
                    </div>

                    {misReservas.length > 0 ? (
                        <div className="space-y-3">
                            {misReservas.map(reserva => (
                                <div key={reserva.idReserva} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="font-bold text-gray-900 uppercase">{reserva.nombreClase}</p>
                                            <p className="text-xs text-gray-500">Fecha de alta: {reserva.fecha}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    {reserva.estado}
                  </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>Aún no tienes clases reservadas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de Reservar Nuevas Clases */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clases Disponibles para Reservar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clasesDisponibles.map(clase => (
                        <div key={clase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="bg-orange-50 p-4 border-b border-orange-100">
                                <h3 className="text-lg font-bold text-gray-900 uppercase">{clase.nombre}</h3>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                    <span>{clase.fechaInicio} al {clase.fechaFin}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Dumbbell className="w-4 h-4 mr-2 text-orange-500" />
                                    <span>Entrenador: {clase.entrenadorNombre}</span>
                                </div>
                                <button
                                    onClick={() => handleReservarClase(clase.id)}
                                    disabled={!miMembresia || miMembresia.estado !== 'ACTIVA'}
                                    className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Reservar Cupo
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}