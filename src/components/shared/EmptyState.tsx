"use client"

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-12 px-4 border-dashed">
      {icon && <div className="mx-auto mb-4 text-muted-foreground/50">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}
