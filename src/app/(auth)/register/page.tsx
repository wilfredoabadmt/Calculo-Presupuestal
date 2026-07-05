"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, Zap, AlertCircle, Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    } else if (formData.name.length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    if (!validate()) return

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error || "Error al registrarse")
        return
      }

      router.push("/login?registered=true")
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Crear Cuenta Gratis</CardTitle>
            <CardDescription>
              Sin tarjeta de crédito • Empieza a calcular en 2 minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn("pl-10", errors.name && "border-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn("pl-10", errors.email && "border-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={cn("pl-10", errors.password && "border-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={cn("pl-10", errors.confirmPassword && "border-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full font-bold" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta gratis"
                )}
              </Button>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
              {[
                "Sin tarjeta de crédito",
                "3 calculadoras gratis",
                "Cancela cuando quieras",
              ].map((t) => (
                <div key={t} className="flex flex-col items-center gap-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" prefetch={false} className="text-primary hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
            <div className="text-xs text-muted-foreground text-center bg-muted/50 px-4 py-2 rounded-lg">
              <strong>Demo:</strong> demo@calculo.com / demo123
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
