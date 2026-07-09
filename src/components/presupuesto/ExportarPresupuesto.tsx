"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, Table2 } from "lucide-react"

interface ExportarPresupuestoProps {
  onExportPDF?: () => void
  onExportExcel?: () => void
}

export function ExportarPresupuesto({ onExportPDF, onExportExcel }: ExportarPresupuestoProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <Button variant="outline" onClick={onExportPDF} className="flex-1 sm:flex-none">
        <FileText className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
      <Button variant="outline" onClick={onExportExcel} className="flex-1 sm:flex-none">
        <Table2 className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  )
}
