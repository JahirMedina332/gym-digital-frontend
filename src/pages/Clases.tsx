import { useEffect, useState } from "react";
import { Dumbbell, Plus, X, Trash2, Pencil, CalendarDays, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClaseResponse {
    id: number;
    nombre: string;
    capacidadMaxima: number;
    fechaInicio: string;
    fechaFin: string;
    nombreEntrenador: string;
}

interface Usuario {
    id: number;
    nombre: string;
    rol: string;
}

export default function Clases() {
    const [clases, setClases] = useState<ClaseResponse[]>([]);
    const [entrenadores, setEntrenadores] = useState<Usuario[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [claseIdEdicion, setClaseIdEdicion] = useState<number | null>(null);

    const estadoInicialForm = { nombre: "", capacidadMaxima: 10, fechaInicio: "", fechaFin: "", entrenadorId: "" };
    const [formData, setFormData] = useState(estadoInicialForm);

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    const fetchData = async () => {
        try {
            const resClases = await fetch("http://localhost:9525/api/clase", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resUsuarios = await fetch("http://localhost:9525/api/usuarios", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resClases.ok && resUsuarios.ok) {
                const dataClases = await resClases.json();
                const dataUsuarios: Usuario[] = await resUsuarios.json();

                setClases(dataClases);
                setEntrenadores(dataUsuarios.filter(u => u.rol === 'ENTRENADOR'));
            } else if (resClases.status === 401) {
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
        setClaseIdEdicion(null);
        setFormData(estadoInicialForm);
        setIsModalOpen(true);
    };

    const abrirModalEditar = (clase: ClaseResponse) => {
        // Buscamos el ID del entrenador basado en su nombre para pre-seleccionar el <select>
        const entrenadorEncontrado = entrenadores.find(e => e.nombre === clase.nombreEntrenador);

        setModoEdicion(true);
        setClaseIdEdicion(clase.id);
        setFormData({
            nombre: clase.nombre,
            capacidadMaxima: clase.capacidadMaxima,
            fechaInicio: clase.fechaInicio,
            fechaFin: clase.fechaFin,
            entrenadorId: entrenadorEncontrado ? entrenadorEncontrado.id.toString() : ""
        });
        setIsModalOpen(true);
    };

    const handleGuardarClase = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificamos que el ID del entrenador exista y sea un número válido
        if (!formData.entrenadorId || isNaN(parseInt(formData.entrenadorId))) {
            alert("⚠️ Por favor, selecciona un entrenador válido de la lista desplegable.");
            return; // Detiene la ejecución aquí mismo y no envía nada al backend
        }

        const payload = {
            nombre: formData.nombre,
            capacidadMaxima: formData.capacidadMaxima,
            fechaInicio: formData.fechaInicio,
            fechaFin: formData.fechaFin,
            entrenador: {
                id: parseInt(formData.entrenadorId)
            }
        };

        const url = modoEdicion
            ? `http://localhost:9525/api/clase/${claseIdEdicion}`
            : "http://localhost:9525/api/clase";
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
                alert("Error en el servidor al guardar la clase. Revisa la consola.");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleEliminarClase = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta clase?")) return;
        try {
            const response = await fetch(`http://localhost:9525/api/clase/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                setClases(clases.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Dumbbell className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Clases</h1>
                        <p className="text-gray-500 mt-1">Programa y administra los horarios del gimnasio.</p>
                    </div>
                </div>

                <button
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Clase
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clases.length > 0 ? (
                    clases.map((clase) => (
                        <div key={clase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900 uppercase pr-2">{clase.nombre}</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => abrirModalEditar(clase)}
                                        className="text-blue-500 hover:text-blue-700 bg-white p-1.5 rounded-md shadow-sm transition-colors"
                                        title="Editar clase"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEliminarClase(clase.id)}
                                        className="text-red-500 hover:text-red-700 bg-white p-1.5 rounded-md shadow-sm transition-colors"
                                        title="Eliminar clase"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-3 flex-1">
                                <div className="flex items-center text-gray-600 text-sm">
                                    <CalendarDays className="h-4 w-4 mr-2 text-orange-500" />
                                    <span>{clase.fechaInicio} al {clase.fechaFin}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                    <span>Capacidad: {clase.capacidadMaxima} alumnos</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Entrenador a cargo</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{clase.nombreEntrenador}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-10 rounded-xl border border-gray-200 text-center">
                        <Dumbbell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay clases programadas.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modoEdicion ? "Editar Clase" : "Programar Nueva Clase"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarClase} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clase (Ej: Crossfit, Yoga)</label>
                                <input
                                    type="text" required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máx.</label>
                                    <input
                                        type="number" min="1" required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.capacidadMaxima}
                                        onChange={(e) => setFormData({...formData, capacidadMaxima: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Entrenador</label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.entrenadorId}
                                        onChange={(e) => setFormData({...formData, entrenadorId: e.target.value})}
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        {entrenadores.map(e => (
                                            <option key={e.id} value={e.id}>{e.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                    <input
                                        type="date" required
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
                                >
                                    {modoEdicion ? "Actualizar Clase" : "Crear Clase"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}