import { useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { OutageCard } from "@/features/outages/components/outage-card"
import { mockOutages } from "@/lib/mock-data"
import { AlertTriangle, WifiOff } from "lucide-react"

export function OutagesPage() {
  const { user } = useAuth()
  const outages = useMemo(() => {
    if (!user) return []
    if (user.role === "customer") return mockOutages
    if (user.role === "technician" || user.role === "supervisor") {
      return mockOutages.filter((o) => o.officeId === user.officeId)
    }
    return mockOutages
  }, [user])

  if (!user) return null

  const active = outages.filter((o) => o.status === "Active")
  const resolved = outages.filter((o) => o.status !== "Active")

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outages</h1>
          <p className="text-muted-foreground">Service disruptions and maintenance notices</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          {active.length} active / {outages.length} total
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Active</h2>
          {active.length === 0 && <WifiOff className="w-4 h-4 text-muted-foreground" />}
        </div>
        {active.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
            No active outages.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((outage) => (
              <OutageCard key={outage._id} outage={outage} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Resolved / Scheduled</h2>
        {resolved.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
            No resolved or scheduled outages.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resolved.map((outage) => (
              <OutageCard key={outage._id} outage={outage} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
