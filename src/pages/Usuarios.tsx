import { useEffect, useState } from "react";
import { Users, Search, Plus, X, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Usuario {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    rol: string;
    fechaRegistro: string;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [busqueda, setBusqueda] = useState("");

    // Estados para el Modal (Crear y Editar)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioIdEdicion, setUsuarioIdEdicion] = useState<number | null>(null);

    const estadoInicialFormulario = { nombre: "", email: "", telefono: "", password: "", rol: "CLIENTE" };
    const [formData, setFormData] = useState(estadoInicialFormulario);

    const navigate = useNavigate();
    const token = localStorage.getItem("jwt_token");

    const fetchUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:9525/api/usuarios", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            } else if (response.status === 401 || response.status === 403) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [navigate]);

    // Función para abrir modal en modo "Crear"
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setUsuarioIdEdicion(null);
        setFormData(estadoInicialFormulario);
        setIsModalOpen(true);
    };

    // Función para abrir modal en modo "Editar"
    const abrirModalEditar = (usuario: Usuario) => {
        setModoEdicion(true);
        setUsuarioIdEdicion(usuario.id);
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono || "",
            password: "", // Se deja vacío para no sobreescribir si no se escribe nada
            rol: usuario.rol
        });
        setIsModalOpen(true);
    };

    // Función para Guardar (Crear POST o Editar PUT)
    const handleGuardarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = modoEdicion
            ? `http://localhost:9525/api/usuarios/${usuarioIdEdicion}`
            : "http://localhost:9525/api/usuarios";

        const metodo = modoEdicion ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchUsuarios();
                setIsModalOpen(false);
            } else {
                alert("Error al guardar el usuario. Verifica los datos.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleEliminarUsuario = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

        try {
            const response = await fetch(`http://localhost:9525/api/usuarios/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok || response.status === 204) {
                setUsuarios(usuarios.filter(user => user.id !== id));
            } else {
                alert("No se pudo eliminar el usuario.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const usuariosFiltrados = usuarios.filter(user =>
        user.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        user.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-gray-500 mt-1">Administra los clientes y personal del gimnasio.</p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Buscar..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {usuariosFiltrados.length > 0 ? (
                            usuariosFiltrados.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                {user.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.telefono || "Sin teléfono"}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              user.rol === 'ENTRENADOR' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                      }`}>
                        {user.rol}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.fechaRegistro).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-2">
                                            {/* Botón Editar */}
                                            <button
                                                onClick={() => abrirModalEditar(user)}
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-md transition-colors"
                                                title="Editar usuario"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            {/* Botón Eliminar */}
                                            <button
                                                onClick={() => handleEliminarUsuario(user.id)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors"
                                                title="Eliminar usuario"
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
                                    No se encontraron usuarios.
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
                            <h2 className="text-lg font-bold text-gray-900">
                                {modoEdicion ? "Editar Usuario" : "Registrar Nuevo Usuario"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleGuardarUsuario} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.telefono}
                                        placeholder="Opcional"
                                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.rol}
                                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                                    >
                                        <option value="CLIENTE">Cliente</option>
                                        <option value="ENTRENADOR">Entrenador</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {modoEdicion ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
                                </label>
                                <input
                                    type="password"
                                    required={!modoEdicion}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    {modoEdicion ? "Actualizar Usuario" : "Guardar Usuario"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}