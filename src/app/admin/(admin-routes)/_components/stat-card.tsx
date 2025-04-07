import type React from "react"

type StatCardProps = {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  color: "blue" | "green" | "purple" | "amber" | "red"
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
}

export default function StatCard({ title, value, icon, description, color }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-sm mt-1 opacity-80">{description}</p>
        </div>
        <div className="p-2 rounded-full bg-white">{icon}</div>
      </div>
    </div>
  )
}

