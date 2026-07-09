"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PresupuestoProvider } from "@/components/presupuesto/PresupuestoContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { Layers, Tag, Ruler, FileText, BarChart3 } from "lucide-react"

export default function PresupuestoDetalladoLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const projectId = params.id as string

  const basePath = `/proyectos/${projectId}/presupuesto-detallado`

  // Determine active tab from URL
  const activeTab = pathname.includes("/altas")
    ? "altas"
    : pathname.includes("/datos")
    ? "datos"
    : pathname.includes("/informe")
    ? "informe"
    : pathname.includes("/resumen")
    ? "resumen"
    : "altas" // default

  const handleTabChange = (value: string) => {
    router.push(`${basePath}/${value}`)
  }

  return (
    <PresupuestoProvider proyectoId={projectId}>
      <div className="space-y-6">
        <PageHeader
          title="Presupuesto Detallado"
          description="Sistema de cómputos métricos y presupuesto por capítulos"
          icon={<Layers className="h-7 w-7 text-primary" />}
          backHref={`/proyectos/${projectId}`}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex w-full overflow-x-auto justify-start sm:grid sm:grid-cols-4 h-auto sm:h-10 no-scrollbar gap-1 sm:gap-0 p-1">
            <TabsTrigger value="altas" className="flex items-center gap-2 shrink-0 sm:shrink">
              <Tag className="h-4 w-4" />
              <span>Altas</span>
            </TabsTrigger>
            <TabsTrigger value="datos" className="flex items-center gap-2 shrink-0 sm:shrink">
              <Ruler className="h-4 w-4" />
              <span>Datos</span>
            </TabsTrigger>
            <TabsTrigger value="informe" className="flex items-center gap-2 shrink-0 sm:shrink">
              <FileText className="h-4 w-4" />
              <span>Informe</span>
            </TabsTrigger>
            <TabsTrigger value="resumen" className="flex items-center gap-2 shrink-0 sm:shrink">
              <BarChart3 className="h-4 w-4" />
              <span>Resumen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </PresupuestoProvider>
  )
}
