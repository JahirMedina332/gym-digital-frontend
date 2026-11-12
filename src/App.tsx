import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import Clases from "@/pages/Clases"
import Usuarios from "@/pages/Usuarios"
import Membresias from "@/pages/Membresias"
import Reservas from "@/pages/Reservas"
import DashboardCliente from "@/pages/DashboardCliente"
import DashboardEntrenador from "@/pages/DashboardEntrenador"


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* RUTA PÚBLICA */}
                <Route path="/login" element={<Login />} />

                {/* RUTAS PRIVADAS */}
                {/* 1. Panel Principal (Dashboard) */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* 2. Pantalla de Usuarios */}
                <Route path="/usuarios" element={
                    <ProtectedRoute>
                        <Layout>
                            <Usuarios />
                        </Layout>
                    </ProtectedRoute>
                } />
                {/* 3. Pantalla de Clases */}
                <Route path="/clases" element={
                    <ProtectedRoute>
                        <Layout>
                            <Clases />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/*4. pantalla de membresias */}
                <Route path="/membresias" element={
                    <ProtectedRoute>
                        <Layout>
                            <Membresias />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/*5. pantalla de reservas */}
                <Route path="/reservas" element={
                    <ProtectedRoute>
                        <Layout>
                            <Reservas />
                        </Layout>
                    </ProtectedRoute>
                } />


            {/*6. pantalla de clientes */}
            <Route path="/DashboardCliente" element={
                <ProtectedRoute>
                    <Layout>
                        <DashboardCliente />
                    </Layout>
                </ProtectedRoute>
            } />

                {/* 7. Dashboard del Entrenador */}
                <Route path="/DashboardEntrenador" element={
                    <ProtectedRoute>
                        <Layout>
                            <DashboardEntrenador />
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>

        </BrowserRouter>
    )
}

export default App