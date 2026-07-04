"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dosificacion {
  ratio: string
  resistencia?: number
  cemento: number
  arena: number
  grava?: number
  agua?: number
}

interface SelectorDosificacionProps {
  dosificaciones: Dosificacion[]
  value: string
  onChange: (value: string) => void
  showResistencia?: boolean
}

export function SelectorDosificacion({ dosificaciones, value, onChange, showResistencia }: SelectorDosificacionProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar dosificación" />
      </SelectTrigger>
      <SelectContent>
        {dosificaciones.map(d => (
          <SelectItem key={d.ratio} value={d.ratio}>
            {d.ratio}{showResistencia && d.resistencia ? ` - ${d.resistencia} kg/cm²` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
