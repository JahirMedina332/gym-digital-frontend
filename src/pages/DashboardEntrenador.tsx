import { useEffect, useState } from "react";
import { CalendarDays, Users, CheckCircle, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClaseResponse {
    id: number;
    nombre: string;
    capacidadMaxima: number;
    fechaInicio: string;
    fechaFin: string;
    nombreEntrenador: string;
}

interface ReservaResponse {
    idReserva: number;
    fecha: string;
    estado: string;
    nombreCliente: string;
    nombreClase: string;
}

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

export default function DashboardEntrenador() {
    const [misClases, setMisClases] = useState<ClaseResponse[]>([]);
    const [misAlumnos, setMisAlumnos] = useState<ReservaResponse[]>([]);
    const [nombreEntrenador, setNombreEntrenador] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const cargarDatosEntrenador = async () => {
            try {
                // 1. Decodificar el token para obtener el ID del usuario actual
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                const miId = decodedPayload.id;

                // 2. Traer todos los datos necesarios en paralelo
                const [resUsuarios, resClases, resReservas] = await Promise.all([
                    fetch("http://localhost:9525/api/usuarios", { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch("http://localhost:9525/api/clase", { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch("http://localhost:9525/api/reserva", { headers: { "Authorization": `Bearer ${token}` } })
                ]);

                if (resUsuarios.ok && resClases.ok && resReservas.ok) {
                    const dataUsuarios: Usuario[] = await resUsuarios.json();
                    const dataClases: ClaseResponse[] = await resClases.json();
                    const dataReservas: ReservaResponse[] = await resReservas.json();

                    // 3. Encontrar mi nombre exacto en la base de datos
                    const yo = dataUsuarios.find(u => u.id === miId);
                    if (yo) {
                        setNombreEntrenador(yo.nombre);

                        // 4. Filtrar solo las clases donde yo soy el entrenador
                        const clasesFiltradas = dataClases.filter(c => c.nombreEntrenador === yo.nombre);
                        setMisClases(clasesFiltradas);

                        // 5. Filtrar las reservas que pertenecen a MIS clases y están confirmadas
                        const nombresDeMisClases = clasesFiltradas.map(c => c.nombre);
                        const alumnosFiltrados = dataReservas.filter(r =>
                            nombresDeMisClases.includes(r.nombreClase) && r.estado === 'CONFIRMADA'
                        );
                        setMisAlumnos(alumnosFiltrados);
                    }
                } else if (resUsuarios.status === 401) {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error conectando con el backend:", error);
            }
        };

        cargarDatosEntrenador();
    }, [navigate, token]);

    return (
        <div className="space-y-6">
            {/* Saludo */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">¡Hola, {nombreEntrenador}!</h1>
                <p className="text-gray-500 mt-1">Este es tu horario y la lista de alumnos inscritos en tus clases.</p>
            </div>

            {/* Lista de Clases y Alumnos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {misClases.length > 0 ? (
                    misClases.map(clase => {
                        // Buscamos los alumnos específicos de ESTA clase
                        const alumnosDeEstaClase = misAlumnos.filter(a => a.nombreClase === clase.nombre);

                        return (
                            <div key={clase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 uppercase flex items-center gap-2">
                                        <Dumbbell className="w-5 h-5 text-blue-600" />
                                        {clase.nombre}
                                    </h3>
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    {alumnosDeEstaClase.length} / {clase.capacidadMaxima} Alumnos
                  </span>
                                </div>

                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                                    <CalendarDays className="w-4 h-4" />
                                    <span>Periodo: {clase.fechaInicio} al {clase.fechaFin}</span>
                                </div>

                                <div className="p-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Lista de Asistencia
                                    </h4>

                                    {alumnosDeEstaClase.length > 0 ? (
                                        <ul className="space-y-2">
                                            {alumnosDeEstaClase.map(alumno => (
                                                <li key={alumno.idReserva} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                    <span className="font-medium text-gray-900">{alumno.nombreCliente}</span>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic text-center py-4">
                                            Aún no hay alumnos inscritos en esta clase.
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-200">
                        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Actualmente no tienes clases asignadas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}