"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InputWithHelpProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  helpText?: string
  unit?: string
  example?: string
  error?: string
  success?: boolean
  showUnit?: boolean
}

export const InputWithHelp = forwardRef<HTMLInputElement, InputWithHelpProps>(
  ({ label, helpText, unit, example, error, success, showUnit = true, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")
    const helpId = `${inputId}-help`
    const errorId = `${inputId}-error`

    return (
      <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {unit && showUnit && (
            <span className="text-xs text-muted-foreground font-normal ml-1">({unit})</span>
          )}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            aria-describedby={cn(helpText && helpId, error && errorId)}
            aria-invalid={!!error}
            className={cn(
              "transition-colors duration-200",
              error && "border-red-500 focus-visible:ring-red-500 bg-red-50",
              success && !error && "border-green-500 focus-visible:ring-green-500",
              helpText && "pr-10"
            )}
            {...props}
          />
          {helpText && (
            <button
              type="button"
              id={helpId}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors"
              aria-label={`Ayuda para ${label}`}
            >
              <Info className="h-4 w-4" />
            </button>
          )}
          {error && (
            <div
              id={errorId}
              className="absolute bottom-full left-0 mb-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap z-10"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {error}
            </div>
          )}
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        {helpText && (
          <p id={helpId} className="text-xs text-muted-foreground" role="tooltip">
            {helpText}
            {example && <span className="ml-2 text-primary/80 font-mono">Ej: {example}</span>}
          </p>
        )}
        {error && <p id={errorId} className="text-xs text-red-600" role="alert">{error}</p>}
      </div>
    )
  }
)

InputWithHelp.displayName = "InputWithHelp"

interface SelectWithHelpProps {
  label: string
  options: { value: string; label: string; help?: string }[]
  value: string
  onValueChange: (value: string) => void
  helpText?: string
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function SelectWithHelp({ label, options, value, onValueChange, helpText, error, placeholder, disabled }: SelectWithHelpProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-")
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={inputId}
            aria-describedby={cn(helpText && helpId, error && errorId)}
            aria-invalid={!!error}
            className={cn(
              "transition-colors duration-200",
              error && "border-red-500 focus-visible:ring-red-500 bg-red-50"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {helpText && (
          <button
            type="button"
            id={helpId}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors"
            aria-label={`Ayuda para ${label}`}
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>
      {helpText && <p id={helpId} className="text-xs text-muted-foreground" role="tooltip">{helpText}</p>}
      {error && <p id={errorId} className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  helpText?: string
  unit?: string
  example?: string
  error?: string
  success?: boolean
  min?: number
  max?: number
  step?: number
  showUnit?: boolean
}

export function NumberInput({ label, helpText, unit, example, error, success, min, max, step, showUnit = true, className, id, ...props }: NumberInputProps) {
  return (
    <InputWithHelp
      label={label}
      helpText={helpText}
      unit={unit}
      example={example}
      error={error}
      success={success}
      showUnit={showUnit}
      type="number"
      min={min}
      max={max}
      step={step}
      id={id}
      className={className}
      {...props}
    />
  )
}