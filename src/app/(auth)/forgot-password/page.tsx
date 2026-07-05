"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Zap, CheckCircle } from "lucide-react"

function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Error al solicitar restablecimiento")
        return
      }

      setSuccess(true)
    } catch {
      setFormError("Error de conexión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Correo enviado!</CardTitle>
            <CardDescription>
              Hemos enviado un enlace de restablecimiento a tu correo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-500/5">
              <AlertDescription className="text-green-700">
                Revisa tu bandeja de entrada (y spam) para continuar.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/login")} className="w-full" variant="outline">
              Volver al login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email para recibir un enlace de restablecimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-bold" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <p className="text-sm text-muted-foreground text-center">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" prefetch={false} className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}