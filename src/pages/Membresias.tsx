import { useEffect, useState } from "react";
import { IdCard, Search, Plus, X, Trash2, Pencil, CalendarCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MembresiaResponse {
    id: number;
    usuarioId: number;
    nombreCliente: string;
    fechaInicio: string;
    fechaFin: string;
    estado: string;
}

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

export default function Membresias() {
    const [membresias, setMembresias] = useState<MembresiaResponse[]>([]);
    const [clientes, setClientes] = useState<Usuario[]>([]);
    const [busqueda, setBusqueda] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [membresiaIdEdicion, setMembresiaIdEdicion] = useState<number | null>(null);

    const estadoInicialForm = { usuarioId: "", fechaInicio: "", fechaFin: "", estadoMembresia: "ACTIVA" };
    const [formData, setFormData] = useState(estadoInicialForm);

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    const fetchData = async () => {
        try {
            const resMembresias = await fetch("http://localhost:9525/api/membresias", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resUsuarios = await fetch("http://localhost:9525/api/usuarios", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resMembresias.ok && resUsuarios.ok) {
                const dataMembresias = await resMembresias.json();
                const dataUsuarios: Usuario[] = await resUsuarios.json();

                setMembresias(dataMembresias);
                // Solo mostramos a los que tienen rol de CLIENTE en la lista para asignar membresías
                setClientes(dataUsuarios.filter(u => u.rol === 'CLIENTE'));
            } else if (resMembresias.status === 401) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Error conectando con el backend:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setMembresiaIdEdicion(null);

        // Autocompletar fecha de hoy y la fecha de un mes después por defecto
        const hoy = new Date();
        const proximoMes = new Date(hoy);
        proximoMes.setMonth(hoy.getMonth() + 1);

        setFormData({
            ...estadoInicialForm,
            fechaInicio: hoy.toISOString().split('T')[0],
            fechaFin: proximoMes.toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const abrirModalEditar = (membresia: MembresiaResponse) => {
        setModoEdicion(true);
        setMembresiaIdEdicion(membresia.id);
        setFormData({
            usuarioId: membresia.usuarioId.toString(),
            fechaInicio: membresia.fechaInicio,
            fechaFin: membresia.fechaFin,
            estadoMembresia: membresia.estado
        });
        setIsModalOpen(true);
    };

    const handleGuardarMembresia = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.usuarioId || isNaN(parseInt(formData.usuarioId))) {
            alert("⚠️ Por favor, selecciona un cliente válido.");
            return;
        }

        const payload = {
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin,
            estadoMembresia: formData.estadoMembresia,
            usuario: {
                id: parseInt(formData.usuarioId)
            }
        };

        const url = modoEdicion
            ? `http://localhost:9525/api/membresias/${membresiaIdEdicion}`
            : "http://localhost:9525/api/membresias";
        const metodo = modoEdicion ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchData();
                setIsModalOpen(false);
            } else {
                alert("Error al guardar la membresía.");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleEliminarMembresia = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta membresía? (Suele ser mejor cambiar su estado a CANCELADA)")) return;
        try {
            const response = await fetch(`http://localhost:9525/api/membresias/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                setMembresias(membresias.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const membresiasFiltradas = membresias.filter(m =>
        m.nombreCliente.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <IdCard className="h-8 w-8 text-emerald-600" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Control de Membresías</h1>
                        <p className="text-gray-500 mt-1">Gestiona los pagos y accesos de tus clientes.</p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            placeholder="Buscar cliente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {membresiasFiltradas.length > 0 ? (
                            membresiasFiltradas.map((membresia) => (
                                <tr key={membresia.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{membresia.nombreCliente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <CalendarCheck className="w-4 h-4 mr-2 text-gray-400" />
                                            {membresia.fechaInicio} / {membresia.fechaFin}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          membresia.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              membresia.estado === 'VENCIDA' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {membresia.estado === 'VENCIDA' && <AlertCircle className="w-3 h-3 mr-1 mt-0.5" />}
                          {membresia.estado}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => abrirModalEditar(membresia)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-md transition-colors" title="Editar">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleEliminarMembresia(membresia.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors" title="Eliminar">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    No hay membresías registradas.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modoEdicion ? "Editar Membresía" : "Nueva Membresía"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarMembresia} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select
                                    required
                                    disabled={modoEdicion} // No se debería cambiar de cliente una vez creada
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                                    value={formData.usuarioId}
                                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                                >
                                    <option value="" disabled>Seleccione un cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Vencimiento)</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    value={formData.estadoMembresia}
                                    onChange={(e) => setFormData({ ...formData, estadoMembresia: e.target.value })}
                                >
                                    {/* Asegúrate de que estos values coincidan EXACTAMENTE con tu Enum en Java */}
                                    <option value="ACTIVA">ACTIVA</option>
                                    <option value="VENCIDA">VENCIDA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                                    {modoEdicion ? "Actualizar" : "Crear Membresía"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}