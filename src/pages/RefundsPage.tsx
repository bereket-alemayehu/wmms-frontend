import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockTickets, mockRefunds, mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  Approved: "bg-success/20 text-success border-success/30",
  Processed: "bg-primary/20 text-primary border-primary/30",
}

export function RefundsPage() {
  const refunds = mockRefunds

  const totalRefundAmount = refunds.filter((r) => r.status === "Approved").reduce((sum, r) => sum + r.amount, 0)
  const refundCount = refunds.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refunds</h1>
          <p className="text-muted-foreground">View all processed refunds</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{refundCount}</p>
            <p className="text-xs text-muted-foreground">Total Refunds</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{totalRefundAmount} ETB</p>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Refunds</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">View all processed refunds</p>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No refunds processed</p>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => {
                const customer = mockUsers.find((u) => u._id === refund.customerId)
                const ticket = mockTickets.find((t) => t._id === refund.ticketId)

                return (
                  <div
                    key={refund._id}
                    className="p-4 bg-secondary rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn(statusColors[refund.status] || "bg-secondary text-secondary-foreground border-border")}>
                          {refund.status}
                        </Badge>
                        <span className="text-sm font-medium text-secondary-foreground">{refund.amount} ETB</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customer?.fullName} • {ticket?.category}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Ticket #{refund.ticketId.slice(-8).toUpperCase()}
                      </p>
                      {refund.adminComment && (
                        <p className="text-xs text-muted-foreground italic mt-1">{refund.adminComment}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

