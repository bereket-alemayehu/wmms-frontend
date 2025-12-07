import { useState } from "react"
import { StatsCard } from "./stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, DollarSign, Ticket, TrendingUp, CheckCircle, X } from "lucide-react"
import { mockTickets, mockRefunds, mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  Requested: "bg-warning/20 text-warning border-warning/30",
  Approved: "bg-success/20 text-success border-success/30",
  Rejected: "bg-destructive/20 text-destructive border-destructive/30",
}

export function ManagerDashboard() {
  const [refunds, setRefunds] = useState(mockRefunds)

  const totalTickets = mockTickets.length
  const resolvedTickets = mockTickets.filter((t) => ["Resolved", "Closed"].includes(t.status)).length
  const pendingRefunds = refunds.filter((r) => r.status === "Requested")
  const totalRefundAmount = refunds.filter((r) => r.status === "Approved").reduce((sum, r) => sum + r.amount, 0)

  const handleRefundAction = (refundId: string, action: "Approved" | "Rejected") => {
    setRefunds((prev) =>
      prev.map((r) =>
        r._id === refundId
          ? {
              ...r,
              status: action,
              adminComment: action === "Approved" ? "Approved by manager" : "Rejected - does not meet criteria",
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground">Overview of operations and financials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tickets"
          value={totalTickets}
          icon={<Ticket className="w-5 h-5" />}
          trend={{ value: 12, positive: false }}
        />
        <StatsCard
          title="Resolution Rate"
          value={`${Math.round((resolvedTickets / totalTickets) * 100)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Pending Refunds"
          value={pendingRefunds.length}
          icon={<DollarSign className="w-5 h-5" />}
          description="Awaiting approval"
        />
        <StatsCard
          title="Total Refunded"
          value={`${totalRefundAmount} ETB`}
          icon={<BarChart3 className="w-5 h-5" />}
          description="This month"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="refunds" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger
            value="refunds"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Refund Requests
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="refunds" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Refund Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {refunds.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No refund requests</p>
              ) : (
                <div className="space-y-4">
                  {refunds.map((refund) => {
                    const customer = mockUsers.find((u) => u._id === refund.customerId)
                    const ticket = mockTickets.find((t) => t._id === refund.ticketId)

                    return (
                      <div
                        key={refund._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn(statusColors[refund.status])}>
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
                            <p className="text-xs text-muted-foreground italic">{refund.adminComment}</p>
                          )}
                        </div>
                        {refund.status === "Requested" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRefundAction(refund._id, "Approved")}
                              className="bg-success text-success-foreground hover:bg-success/90"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRefundAction(refund._id, "Rejected")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["No Connection", "Speed Issue", "Hardware Fault", "Other"].map((category) => {
                    const count = mockTickets.filter((t) => t.category === category).length
                    const percentage = Math.round((count / totalTickets) * 100)
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-card-foreground">{category}</span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">Technician Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsers
                    .filter((u) => u.role === "technician")
                    .map((tech) => {
                      const resolved = mockTickets.filter(
                        (t) => t.assignedTo === tech._id && ["Resolved", "Closed"].includes(t.status),
                      ).length
                      return (
                        <div key={tech._id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                              {tech.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <span className="text-sm font-medium text-secondary-foreground">{tech.fullName}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-secondary-foreground">{resolved} resolved</p>
                            <p className="text-xs text-muted-foreground">this month</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

