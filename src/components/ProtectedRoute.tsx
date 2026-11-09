import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // Buscamos si existe el token en la memoria del navegador
    const token = localStorage.getItem("jwt_token")

    // Si no hay token, lo mandamos de regreso al Login inmediatamente
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // Si sí tiene token, lo dejamos pasar a la pantalla que pidió (children)
    return <>{children}</>
}