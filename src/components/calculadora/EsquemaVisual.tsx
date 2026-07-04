"use client"

interface EsquemaVisualProps {
  titulo: string
  children: React.ReactNode
}

export function EsquemaVisual({ titulo, children }: EsquemaVisualProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-6 text-center">
      <div className="text-sm text-muted-foreground mb-2">{titulo}</div>
      <div className="mx-auto max-w-xs">{children}</div>
    </div>
  )
}
