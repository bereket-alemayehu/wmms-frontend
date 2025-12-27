import { useState, useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, CheckCircle, Clock, MapPin, Phone, User, Filter } from "lucide-react"
import { mockTickets, mockUsers, mockOffices } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { Ticket } from "@/features/tickets/types"

const statusColors: Record<string, string> = {
  Assigned: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "In Progress": "bg-primary/20 text-primary border-primary/30",
  Resolved: "bg-success/20 text-success border-success/30",
}

export function TasksPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>(
    mockTickets.filter((t) => t.assignedTo === user?._id),
  )
  const [activeTab, setActiveTab] = useState("all")

  if (!user) return null

  const assignedTickets = tickets.filter((t) => t.status === "Assigned")
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress")
  const resolvedTickets = tickets.filter((t) => ["Resolved", "Closed"].includes(t.status))

  const filteredTickets = useMemo(() => {
    switch (activeTab) {
      case "assigned":
        return assignedTickets
      case "in-progress":
        return inProgressTickets
      case "resolved":
        return resolvedTickets
      default:
        return tickets.filter((t) => ["Assigned", "In Progress"].includes(t.status))
    }
  }, [activeTab, tickets, assignedTickets, inProgressTickets, resolvedTickets])

  const handleStatusChange = (ticketId: string, newStatus: "In Progress" | "Resolved") => {
    if (newStatus === "Resolved") {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: "Resolved", updatedAt: new Date().toISOString() } : t)),
      )
    } else {
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t)),
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Tasks</h1>
          <p className="text-muted-foreground">Manage and track all your assigned tickets</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{filteredTickets.length} task(s)</span>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All Active</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedTickets.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressTickets.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Wrench className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No tasks found</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "all"
                  ? "You don't have any active tasks at the moment."
                  : activeTab === "assigned"
                    ? "No tasks are currently assigned to you."
                    : activeTab === "in-progress"
                      ? "You don't have any tasks in progress."
                      : "No resolved tasks to display."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTickets.map((ticket) => {
                const customer = mockUsers.find((u) => u._id === ticket.customerId)
                const office = mockOffices.find((o) => o._id === ticket.officeId)
                const createdDate = new Date(ticket.createdAt)
                const daysOpen = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Card key={ticket._id} className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("font-medium", statusColors[ticket.status] || "bg-secondary text-secondary-foreground border-border")}>
                              {ticket.status}
                            </Badge>
                            <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
                              {ticket.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">#{ticket._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {ticket.description && (
                        <p className="text-sm text-card-foreground line-clamp-3">{ticket.description}</p>
                      )}

                      {/* Customer Info */}
                      {customer && (
                        <div className="p-3 bg-secondary rounded-lg space-y-2">
                          <p className="text-sm font-medium text-secondary-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {customer.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {customer.phoneNumber}
                          </p>
                          {customer.serviceNumber && (
                            <p className="text-sm text-muted-foreground">Service #: {customer.serviceNumber}</p>
                          )}
                        </div>
                      )}

                      {/* Office Location */}
                      {office && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {office.location}
                        </p>
                      )}

                      {/* Time Info */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{daysOpen === 0 ? "Today" : daysOpen === 1 ? "1 day ago" : `${daysOpen} days ago`}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 flex-wrap">
                      {ticket.status === "Assigned" && (
                        <Button
                          onClick={() => handleStatusChange(ticket._id, "In Progress")}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 min-w-[120px]"
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Start Working
                        </Button>
                      )}
                      {ticket.status === "In Progress" && (
                        <Button
                          onClick={() => handleStatusChange(ticket._id, "Resolved")}
                          className="bg-success text-success-foreground hover:bg-success/90 flex-1 min-w-[120px]"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="border-border text-card-foreground bg-transparent"
                        onClick={() => window.open(`tel:${customer?.phoneNumber}`)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

