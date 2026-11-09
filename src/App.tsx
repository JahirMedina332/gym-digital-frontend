import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* RUTA PÚBLICA */}
                <Route path="/login" element={<Login />} />

                {/* RUTA PRIVADA: Ahora está protegida por ProtectedRoute */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } />

            </Routes>
        </BrowserRouter>
    )
}

export default App