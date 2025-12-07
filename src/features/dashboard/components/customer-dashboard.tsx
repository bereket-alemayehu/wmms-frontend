import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { StatsCard } from "./stats-card"
import { TicketCard } from "@/features/tickets/components/ticket-card"
import { OutageCard } from "@/features/outages/components/outage-card"
import { CreateTicketDialog } from "@/features/tickets/components/create-ticket-dialog"
import { mockTickets, mockOutages, checkRefundEligibility } from "@/lib/mock-data"
import { Ticket, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import type { TicketCategory } from "@/features/tickets/types"

export function CustomerDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState(mockTickets.filter((t) => t.customerId === user?._id))

  const activeOutages = mockOutages.filter((o) => o.status === "Active")
  const openTickets = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status))
  const resolvedTickets = tickets.filter((t) => ["Resolved", "Closed"].includes(t.status))
  const refundEligible = tickets.filter((t) => checkRefundEligibility(t) && !t.refundRequested)

  const handleCreateTicket = async (data: { category: TicketCategory; description: string; officeId: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newTicket = {
      _id: `ticket${Date.now()}`,
      customerId: user!._id,
      officeId: data.officeId,
      category: data.category,
      description: data.description,
      status: "Pending" as const,
      refundEligible: false,
      refundRequested: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTickets((prev) => [newTicket, ...prev])
  }

  const handleTicketAction = (action: string, ticketId: string) => {
    if (action === "request-refund") {
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? { ...t, refundRequested: true } : t)))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Track your support tickets and service status</p>
        </div>
        <CreateTicketDialog onSubmit={handleCreateTicket} />
      </div>

      {/* Active Outages Banner */}
      {activeOutages.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Active Service Outages</span>
          </div>
          <p className="text-sm text-muted-foreground">
            There are {activeOutages.length} active outage(s) in your area that may affect your service.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Open Tickets"
          value={openTickets.length}
          icon={<Ticket className="w-5 h-5" />}
          description="Awaiting resolution"
        />
        <StatsCard
          title="Resolved"
          value={resolvedTickets.length}
          icon={<CheckCircle className="w-5 h-5" />}
          description="This month"
        />
        <StatsCard
          title="Avg. Wait Time"
          value="2.5 days"
          icon={<Clock className="w-5 h-5" />}
          description="Current estimate"
        />
        <StatsCard
          title="Refund Eligible"
          value={refundEligible.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          description="Over 7 days open"
        />
      </div>

      {/* Active Outages Section */}
      {activeOutages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Service Outages</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeOutages.map((outage) => (
              <OutageCard key={outage._id} outage={outage} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Tickets */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Tickets</h2>
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tickets yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                showQueue
                onAction={handleTicketAction}
                actions={
                  checkRefundEligibility(ticket) && !ticket.refundRequested
                    ? [{ label: "Request Refund", action: "request-refund", variant: "destructive" as const }]
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

