"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Plus, Calculator, FileText, Calendar, X, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const steps: OnboardingStep[] = [
  {
    id: "create_project",
    title: "Crear tu primer proyecto",
    description: "Ingresa datos del cliente y empresa",
    href: "/proyectos/nuevo",
    icon: Plus,
  },
  {
    id: "use_calculator",
    title: "Usar una calculadora",
    description: "Calcula materiales con concreto, paredes o pisos",
    href: "/proyectos/nuevo/calculadora/concreto",
    icon: Calculator,
  },
  {
    id: "view_budget",
    description: "Revisa el presupuesto con AIU",
    title: "Ver tu presupuesto",
    href: "/proyectos",
    icon: FileText,
  },
  {
    id: "open_gantt",
    title: "Abrir el cronograma",
    description: "Visualiza el Gantt y la Curva S",
    href: "/proyectos",
    icon: Calendar,
  },
]

const STORAGE_KEY = "onboarding_completed"

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.dismissed) {
          setDismissed(true)
        } else {
          setCompleted(data.completed || {})
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const completedCount = Object.values(completed).filter(Boolean).length
  const total = steps.length
  const progress = Math.round((completedCount / total) * 100)

  const markComplete = (stepId: string) => {
    const updated = { ...completed, [stepId]: true }
    setCompleted(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: updated, dismissed }))
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, dismissed: true }))
  }

  if (dismissed || completedCount === total) {
    return null
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Primeros pasos</CardTitle>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{total} completados
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={dismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-border rounded-full h-2 mt-3">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {steps.map((step) => {
            const isComplete = completed[step.id]
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
                  isComplete ? "bg-green-500/5" : "hover:bg-accent/50"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium", isComplete && "line-through text-muted-foreground")}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {!isComplete && (
                  <Link href={step.href}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => markComplete(step.id)}
                    >
                      <step.icon className="h-4 w-4 mr-1" />
                      Ir
                    </Button>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
