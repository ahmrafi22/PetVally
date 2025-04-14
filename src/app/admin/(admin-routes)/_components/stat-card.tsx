import type React from "react"

type StatCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  color: "blue" | "green" | "purple" | "amber" | "red" | "emerald" | "indigo" | "rose"
  isCurrency?: boolean
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
}

export default function StatCard({ title, value, icon, description, color, isCurrency = false }: StatCardProps) {
  const formattedValue = isCurrency
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
    : value.toLocaleString()

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-2">{formattedValue}</p>
          <p className="text-sm mt-1 opacity-80">{description}</p>
        </div>
        <div className="p-2 rounded-full bg-white">{icon}</div>
      </div>
    </div>
  )
}
