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
            console.log("Intentando iniciar sesión con:", { email, password });

            // 1. Petición real al backend
            const response = await fetch("http://localhost:9525/api/auth/login",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            // Extraemos lo que sea que responda el backend
            const data = await response.json();
            console.log("Respuesta exacta del backend:", data); // Este es nuestro "chismoso"

            if (!response.ok) {
                throw new Error("Credenciales inválidas");
            }

            // 2. Extraer el token (cubre varios nombres comunes)
            const tokenGenerado = data.token || data.jwt || data.accessToken;

            if (!tokenGenerado) {
                throw new Error("El backend respondió OK, pero no se encontró el token.");
            }

            // 3. Guardar el token en el almacenamiento local
            localStorage.setItem("jwt_token", tokenGenerado);

            // 4. Redirección inteligente basada en el rol
            const payloadBase64 = tokenGenerado.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            const rolUsuario = decodedPayload.rol;

            console.log("Rol detectado:", rolUsuario);

            // El guardia de tráfico decide a dónde enviarte
            if (rolUsuario === "ADMIN") {
                navigate("/");
            } else if (rolUsuario === "ENTRENADOR") {
                navigate("/DashboardEntrenador");
            } else {
                navigate("/DashboardCliente");
            }

        } catch (err: any) {
            setError("Error al iniciar sesión. Verifica tus datos.")
            console.error("Detalle del error:", err.message)
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
                            placeholder="usuario@gymdigital.com"
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