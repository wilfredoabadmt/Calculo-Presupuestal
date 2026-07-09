"use client"

import { useState } from "react"
import { Calculator, Hammer, Layers, Ruler, Sparkles, Cpu, HardHat } from "lucide-react"

type MockCalculator = {
  name: string
  icon: any
  description: string
  fields: { key: string; label: string; unit: string; defaultVal: string }[]
  renderDiagram: (vals: Record<string, string>) => React.ReactNode
  materials: (vals: Record<string, string>) => { name: string; qty: string; unit: string }[]
}

export default function CalculatorShowcase() {
  const [activeTab, setActiveTab] = useState(0)
  const [vals, setVals] = useState<Record<string, string>>({
    ancho: "6.00",
    largo: "10.00",
    alto: "3.00",
    dimA: "0.40",
    dimB: "0.25",
    espesor: "0.12",
  })
  const [calculating, setCalculating] = useState(false)
  const [showResults, setShowResults] = useState(true)

  const handleValChange = (key: string, val: string) => {
    setVals(prev => ({ ...prev, [key]: val }))
    setShowResults(true)
  }

  const triggerCalculate = () => {
    setCalculating(true)
    setTimeout(() => {
      setCalculating(false)
      setShowResults(true)
    }, 600)
  }

  const calculators: MockCalculator[] = [
    {
      name: "Techos y Tejas",
      icon: Hammer,
      description: "Cálculo de área de faldones con pendiente e insumos de cobertura.",
      fields: [
        { key: "ancho", label: "Ancho (frente)", unit: "m", defaultVal: "6.00" },
        { key: "largo", label: "Largo (pendiente)", unit: "m", defaultVal: "10.00" },
        { key: "alto", label: "Alto cumbrera", unit: "m", defaultVal: "3.00" },
      ],
      materials: (v) => {
        const w = parseFloat(v.ancho) || 0
        const l = parseFloat(v.largo) || 0
        const h = parseFloat(v.alto) || 0
        const area = Math.round(Math.sqrt(l * l + h * h) * w * 10) / 10
        return [
          { name: "Tejas coloniales", qty: Math.ceil(area * 12).toString(), unit: "pzas" },
          { name: "Listones de madera", qty: Math.ceil(area * 1.5).toString(), unit: "ml" },
          { name: "Clavos para techumbre", qty: (area * 0.2).toFixed(1), unit: "kg" },
        ]
      },
      renderDiagram: (v) => (
        <svg className="w-full h-full max-h-[180px]" viewBox="0 0 300 150">
          <polygon points="40,120 240,120 240,40" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <line x1="40" y1="120" x2="240" y2="40" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2"/>
          {/* Ancho */}
          <line x1="40" y1="135" x2="240" y2="135" stroke="#f97316" strokeWidth="1.2"/>
          <text x="140" y="146" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="bold">
            Ancho: {v.ancho || "0"} m
          </text>
          {/* Alto */}
          <line x1="252" y1="120" x2="252" y2="40" stroke="#3b82f6" strokeWidth="1.2"/>
          <text x="272" y="85" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold" transform="rotate(90,272,85)">
            Alto: {v.alto || "0"} m
          </text>
          {/* Largo */}
          <text x="130" y="68" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="bold" transform="rotate(-22,130,68)">
            Largo: {v.largo || "0"} m
          </text>
        </svg>
      )
    },
    {
      name: "Vigas de Hormigón",
      icon: Ruler,
      description: "Cálculo de volumen de concreto, estribos y fierro longitudinal.",
      fields: [
        { key: "largo", label: "Largo Viga", unit: "m", defaultVal: "4.00" },
        { key: "dimA", label: "Alto (a)", unit: "m", defaultVal: "0.40" },
        { key: "dimB", label: "Base (b)", unit: "m", defaultVal: "0.25" },
      ],
      materials: (v) => {
        const l = parseFloat(v.largo) || 0
        const a = parseFloat(v.dimA) || 0
        const b = parseFloat(v.dimB) || 0
        const vol = l * a * b
        return [
          { name: "Cemento IP-40", qty: Math.ceil(vol * 7).toString(), unit: "bolsas" },
          { name: "Arena fina", qty: (vol * 0.5).toFixed(2), unit: "m³" },
          { name: "Grava lavada", qty: (vol * 0.8).toFixed(2), unit: "m³" },
          { name: "Acero corrugado", qty: Math.ceil(vol * 95).toString(), unit: "kg" },
        ]
      },
      renderDiagram: (v) => (
        <svg className="w-full h-full max-h-[180px]" viewBox="0 0 300 150">
          <rect x="50" y="40" width="200" height="55" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          {/* Largo */}
          <line x1="50" y1="28" x2="250" y2="28" stroke="#f97316" strokeWidth="1.2"/>
          <text x="150" y="22" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="bold">
            Largo: {v.largo || "0"} m
          </text>
          {/* Alto */}
          <line x1="36" y1="40" x2="36" y2="95" stroke="#3b82f6" strokeWidth="1.2"/>
          <text x="28" y="70" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold" transform="rotate(-90,28,70)">
            Alto a: {v.dimA || "0"} m
          </text>
          {/* Base */}
          <line x1="50" y1="110" x2="250" y2="110" stroke="#22c55e" strokeWidth="1.2"/>
          <text x="150" y="122" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="bold">
            Base b: {v.dimB || "0"} m
          </text>
        </svg>
      )
    },
    {
      name: "Pisos y Revestimientos",
      icon: Layers,
      description: "Cálculo de piezas cerámicas, pegamento y juntas de colocación.",
      fields: [
        { key: "ancho", label: "Ancho área", unit: "m", defaultVal: "4.00" },
        { key: "largo", label: "Largo área", unit: "m", defaultVal: "5.00" },
      ],
      materials: (v) => {
        const w = parseFloat(v.ancho) || 0
        const l = parseFloat(v.largo) || 0
        const area = w * l
        return [
          { name: "Caja Cerámica 60x60", qty: Math.ceil(area * 1.05 / 1.44).toString(), unit: "cajas" },
          { name: "Pegamento cerámico", qty: Math.ceil(area * 5).toString(), unit: "kg" },
          { name: "Pastina tapajuntas", qty: (area * 0.35).toFixed(1), unit: "kg" },
        ]
      },
      renderDiagram: (v) => (
        <svg className="w-full h-full max-h-[180px]" viewBox="0 0 300 150">
          <rect x="60" y="30" width="160" height="80" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <line x1="100" y1="30" x2="100" y2="110" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
          <line x1="140" y1="30" x2="140" y2="110" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
          <line x1="180" y1="30" x2="180" y2="110" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
          <line x1="60" y1="56" x2="220" y2="56" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
          <line x1="60" y1="83" x2="220" y2="83" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
          {/* Ancho */}
          <line x1="60" y1="122" x2="220" y2="122" stroke="#f97316" strokeWidth="1.2"/>
          <text x="140" y="134" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="bold">
            Ancho: {v.ancho || "0"} m
          </text>
          {/* Largo */}
          <line x1="232" y1="30" x2="232" y2="110" stroke="#3b82f6" strokeWidth="1.2"/>
          <text x="246" y="70" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="bold" transform="rotate(90,246,70)">
            Largo: {v.largo || "0"} m
          </text>
        </svg>
      )
    }
  ]

  const activeCalc = calculators[activeTab]

  return (
    <div className="w-full bg-slate-900/35 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-sm relative overflow-hidden">
      {/* CAD grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none" />

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 mb-6 overflow-x-auto pb-px">
        {calculators.map((c, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveTab(i)
              // Reset values for new calculator schema
              const nextVals = { ...vals }
              c.fields.forEach(f => {
                nextVals[f.key] = f.defaultVal
              })
              setVals(nextVals)
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg border-t-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === i
                ? "border-cyan-500 bg-slate-900 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <c.icon className="h-4 w-4" />
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-12 gap-6 relative z-10">
        {/* Left Side: Mock Form Fields */}
        <div className="md:col-span-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Parámetros del Plano
            </h4>
            <p className="text-xs text-slate-500">{activeCalc.description}</p>
          </div>

          <div className="space-y-3">
            {activeCalc.fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 flex justify-between">
                  <span>{f.label}</span>
                  <span className="text-cyan-500 font-mono">[{f.unit}]</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={vals[f.key] || ""}
                  onChange={e => handleValChange(f.key, e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={triggerCalculate}
            disabled={calculating}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold py-2.5 rounded-lg text-xs tracking-wider transition-all duration-300 shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2"
          >
            {calculating ? (
              <>
                <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Procesando Cotización...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Calcular Materiales
              </>
            )}
          </button>
        </div>

        {/* Right Side: Interactive CAD-style Viewport */}
        <div className="md:col-span-7 flex flex-col justify-between border border-slate-800 bg-slate-950/50 rounded-xl p-4 min-h-[220px]">
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-800 pb-2 mb-2">
            <span className="font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              VIEWPORT 3D.CAD
            </span>
            <span className="font-semibold text-cyan-400">Escala Dinámica</span>
          </div>

          <div className="flex-1 flex items-center justify-center py-2 text-slate-300">
            {activeCalc.renderDiagram(vals)}
          </div>

          {/* Real-time materials outcome */}
          {showResults && (
            <div className="mt-3 pt-3 border-t border-slate-900 bg-slate-950/80 rounded-lg p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <HardHat className="h-3.5 w-3.5 text-cyan-400" />
                Cómputos Métricos Sugeridos
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeCalc.materials(vals).map((m, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800/40 p-2 rounded text-center">
                    <div className="text-[9px] text-slate-500 truncate" title={m.name}>{m.name}</div>
                    <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
                      {m.qty} <span className="text-[9px] text-slate-400 font-normal">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
