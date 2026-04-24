import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  valueColor?: string
}

export function StatCard({ title, value, icon, trend, valueColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-3xl font-bold ${valueColor || ''}`}>
          {value}
        </div>
        {trend && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}
