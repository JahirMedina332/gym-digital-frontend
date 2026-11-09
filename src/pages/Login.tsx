import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Herramienta para cambiar de página
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Petición HTTP hacia tu backend en Spring Boot
            // NOTA: Ajusta la ruta "/auth/login" si tu endpoint en Java es diferente
            const response = await fetch("http://localhost:9525/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                throw new Error("Credenciales incorrectas")
            }

            const data = await response.json()

            // Guardamos el token JWT en el almacenamiento del navegador
            // Ajusta "data.token" dependiendo de cómo tu backend envíe el JSON
            localStorage.setItem("jwt_token", data.token)

            // Redirigimos al usuario al Layout principal (Dashboard)
            navigate("/")

        } catch (err) {
            setError("Error al iniciar sesión. Verifica tus datos.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-6 border border-border rounded-lg bg-card shadow-sm">

                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-bold">Gym Digital</h2>
                    <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@gymdigital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Mensaje de error visual si falla el login */}
                    {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}

                    {/* El botón se deshabilita mientras carga */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Conectando..." : "Entrar al Sistema"}
                    </Button>
                </form>

            </div>
        </div>
    )
}