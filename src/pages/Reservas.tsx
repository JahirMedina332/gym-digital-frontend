import { useEffect, useState } from "react";
import { CalendarCheck, Search, Plus, X, Trash2, Ban, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Coincide con tu ReservaResponseDTO en Java
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

interface Clase {
    id: number;
    nombre: string;
}

export default function Reservas() {
    const [reservas, setReservas] = useState<ReservaResponse[]>([]);
    const [clientes, setClientes] = useState<Usuario[]>([]);
    const [clases, setClases] = useState<Clase[]>([]);
    const [busqueda, setBusqueda] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ usuarioId: "", claseId: "", estado: "CONFIRMADA" });

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    const fetchData = async () => {
        try {
            const [resReservas, resUsuarios, resClases] = await Promise.all([
                fetch("http://localhost:9525/api/reserva", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:9525/api/usuarios", { headers: { "Authorization": `Bearer ${token}` } }),
                fetch("http://localhost:9525/api/clase", { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (resReservas.ok && resUsuarios.ok && resClases.ok) {
                const dataReservas = await resReservas.json();
                const dataUsuarios = await resUsuarios.json();
                const dataClases = await resClases.json();

                setReservas(dataReservas);
                setClientes(dataUsuarios.filter((u: Usuario) => u.rol === 'CLIENTE'));
                setClases(dataClases);
            } else if (resReservas.status === 401) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Error conectando con el backend:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const handleCrearReserva = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.usuarioId || !formData.claseId) {
            alert("⚠️ Por favor selecciona un cliente y una clase.");
            return;
        }

        const payload = {
            usuario: { id: parseInt(formData.usuarioId) },
            clase: { id: parseInt(formData.claseId) },
            estado: formData.estado
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
                fetchData();
                setIsModalOpen(false);
                setFormData({ usuarioId: "", claseId: "", estado: "CONFIRMADA" });
            } else {
                // Tu backend devuelve mensajes de error por capacidad o duplicados, los podemos ver aquí.
                alert("No se pudo crear la reserva. La clase puede estar llena o el usuario ya está registrado.");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    // Llama a tu @PutMapping("/{id}/cancelar")
    const handleCancelarReserva = async (idReserva: number) => {
        if (!window.confirm("¿Estás seguro de cancelar esta reserva?")) return;
        try {
            const response = await fetch(`http://localhost:9525/api/reserva/${idReserva}/cancelar`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                fetchData();
            } else {
                alert("La reserva ya estaba cancelada o ocurrió un error.");
            }
        } catch (error) {
            console.error("Error al cancelar:", error);
        }
    };

    const handleEliminarReserva = async (idReserva: number) => {
        if (!window.confirm("¿Seguro que deseas ELIMINAR por completo este registro?")) return;
        try {
            const response = await fetch(`http://localhost:9525/api/reserva/${idReserva}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                setReservas(reservas.filter(r => r.idReserva !== idReserva));
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const reservasFiltradas = reservas.filter(r =>
        r.nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.nombreClase.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <CalendarCheck className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Control de Reservas</h1>
                        <p className="text-gray-500 mt-1">Supervisa quién asiste a las clases programadas.</p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Buscar cliente o clase..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Alta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {reservasFiltradas.length > 0 ? (
                            reservasFiltradas.map((reserva) => (
                                <tr key={reserva.idReserva} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{reserva.nombreCliente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-indigo-600 font-medium uppercase">{reserva.nombreClase}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {reserva.fecha}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          reserva.estado === 'CANCELADO' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {reserva.estado === 'CANCELADO' ? <Ban className="w-3 h-3 mr-1 mt-0.5" /> : <CheckCircle className="w-3 h-3 mr-1 mt-0.5" />}
                          {reserva.estado}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2">
                                            {/* Botón para Cancelar la reserva (PUT) */}
                                            {reserva.estado !== 'CANCELADO' && (
                                                <button
                                                    onClick={() => handleCancelarReserva(reserva.idReserva)}
                                                    className="text-orange-500 hover:text-orange-700 bg-orange-50 p-2 rounded-md transition-colors"
                                                    title="Marcar como Cancelada"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}
                                            {/* Botón para Eliminar registro (DELETE) */}
                                            <button
                                                onClick={() => handleEliminarReserva(reserva.idReserva)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors"
                                                title="Eliminar registro"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No hay reservas registradas.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold text-gray-900">Anotar Cliente a Clase</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCrearReserva} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.usuarioId}
                                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                                >
                                    <option value="" disabled>Seleccione un cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clase Programada</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.claseId}
                                    onChange={(e) => setFormData({ ...formData, claseId: e.target.value })}
                                >
                                    <option value="" disabled>Seleccione una clase...</option>
                                    {clases.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la Reserva</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    {/* Asegúrate de que coincida con los valores de tu Enum en Java (ej: CONFIRMADA o ACTIVA) */}
                                    <option value="CONFIRMADA">CONFIRMADA</option>
                                    <option value="PENDIENTE">PENDIENTE</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                                    Cerrar
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                                    Guardar Reserva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}