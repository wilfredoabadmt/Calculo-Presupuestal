"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet } from "lucide-react"

export function ImportarPrecios() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> Importar desde Excel</CardTitle>
        <CardDescription>Importa materiales y precios desde un archivo .xlsx o .xls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Arrastra un archivo aquí o haz clic para seleccionar</p>
          <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: .xlsx, .xls, .csv</p>
        </div>
        <Button className="w-full"><Upload className="mr-2 h-4 w-4" /> Seleccionar Archivo</Button>
      </CardContent>
    </Card>
  )
}
