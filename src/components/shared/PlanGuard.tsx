"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { isProActive } from "@/lib/plan"

interface PlanGuardProps {
  children: React.ReactNode
  requiredPlan?: "FREE" | "PRO"
}

export function PlanGuard({ children, requiredPlan = "PRO" }: PlanGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const hasAccess = requiredPlan === "FREE" || isProActive(session?.user as any)

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Calculadora Pro</h2>
            <p className="text-muted-foreground mb-6">
              Esta calculadora requiere el <strong>Plan Pro</strong>. 
              Actualiza para desbloquear las 14 calculadoras completas.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/precios">
                <Button className="w-full gap-2 font-bold">
                  Ver Plan Pro - $19/mes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
