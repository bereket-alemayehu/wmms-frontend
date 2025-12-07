import { useMemo, useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { TicketCard } from "@/features/tickets/components/ticket-card"
import { CreateTicketDialog } from "@/features/tickets/components/create-ticket-dialog"
import { checkRefundEligibility, mockTickets } from "@/lib/mock-data"
import type { Ticket, TicketCategory } from "@/features/tickets/types"
import { AlertTriangle, Ticket as TicketIcon } from "lucide-react"

export function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>(
    mockTickets.filter((t) => {
      if (user?.role === "customer") return t.customerId === user._id
      if (user?.role === "technician") return t.assignedTo === user._id
      if (user?.role === "supervisor") return t.officeId === user.officeId
      return true
    }),
  )
  if (!user) return null
  const role = user.role

  const sections =
    role === "customer"
      ? [{ title: "Your Tickets", tickets }]
      : [
          { title: "Pending", tickets: tickets.filter((t) => t.status === "Pending") },
          { title: "Assigned", tickets: tickets.filter((t) => t.status === "Assigned") },
          { title: "In Progress", tickets: tickets.filter((t) => t.status === "In Progress") },
          { title: "Resolved / Closed", tickets: tickets.filter((t) => ["Resolved", "Closed"].includes(t.status)) },
        ]

  const handleCreateTicket = async (data: { category: TicketCategory; description: string; officeId: string }) => {
    await new Promise((r) => setTimeout(r, 500))
    const newTicket: Ticket = {
      _id: `ticket-${Date.now()}`,
      customerId: user._id,
      officeId: data.officeId,
      category: data.category,
      description: data.description,
      status: "Pending",
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

  const showCustomer = useMemo(() => role === "supervisor" || role === "manager", [role])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground">Track and manage support requests</p>
        </div>
        {role === "customer" ? (
          <CreateTicketDialog onSubmit={handleCreateTicket} />
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TicketIcon className="w-4 h-4" />
            {tickets.length} ticket(s)
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              {section.tickets.length === 0 && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
            </div>
            {section.tickets.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
                No tickets in this section.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {section.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    showQueue={role === "customer"}
                    showCustomer={showCustomer}
                    onAction={role === "customer" ? handleTicketAction : undefined}
                    actions={
                      role === "customer" && checkRefundEligibility(ticket) && !ticket.refundRequested
                        ? [{ label: "Request Refund", action: "request-refund", variant: "destructive" as const }]
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
