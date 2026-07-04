"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Material {
  value: string
  label: string
  detail?: string
}

interface SelectorMaterialProps {
  materiales: Material[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SelectorMaterial({ materiales, value, onChange, placeholder = "Seleccionar" }: SelectorMaterialProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {materiales.map(m => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}{m.detail ? ` (${m.detail})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
