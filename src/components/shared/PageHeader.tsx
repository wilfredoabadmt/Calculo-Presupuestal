"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  backHref?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, icon, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {backHref && (
          <Link href={backHref} className="p-2 hover:bg-accent rounded-lg shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 min-w-0">
            <span className="shrink-0 flex items-center">{icon}</span>
            <span className="min-w-0 break-words">{title}</span>
          </h1>
          {description && <p className="text-muted-foreground break-words">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
