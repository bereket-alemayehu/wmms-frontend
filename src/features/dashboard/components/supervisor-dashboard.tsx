import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { StatsCard } from "./stats-card"
import { TicketCard } from "@/features/tickets/components/ticket-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Users, AlertTriangle, Clock, Plus } from "lucide-react"
import { mockTickets, mockUsers, mockOutages } from "@/lib/mock-data"
import { PostOutageDialog } from "@/features/outages/components/post-outage-dialog"
import type { Outage } from "@/lib/types"

export function SupervisorDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState(mockTickets)
  const [outages, setOutages] = useState<Outage[]>(mockOutages)
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; ticketId: string | null }>({
    open: false,
    ticketId: null,
  })
  const [outageDialog, setOutageDialog] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState("")

  const technicians = mockUsers.filter((u) => u.role === "technician" && u.officeId === user?.officeId)
  const pendingTickets = tickets.filter((t) => t.status === "Pending" && t.officeId === user?.officeId)
  const assignedTickets = tickets.filter((t) => t.status === "Assigned" && t.officeId === user?.officeId)
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress" && t.officeId === user?.officeId)
  const activeOutages = outages.filter((o) => o.status === "Active" && o.officeId === user?.officeId)

  const handleAssign = () => {
    if (!assignDialog.ticketId || !selectedTechnician) return
    setTickets((prev) =>
      prev.map((t) =>
        t._id === assignDialog.ticketId
          ? { ...t, status: "Assigned", assignedTo: selectedTechnician, updatedAt: new Date().toISOString() }
          : t,
      ),
    )
    setAssignDialog({ open: false, ticketId: null })
    setSelectedTechnician("")
  }

  const handleTicketAction = (action: string, ticketId: string) => {
    if (action === "assign") {
      setAssignDialog({ open: true, ticketId })
    }
  }

  const handlePostOutage = async (data: {
    title: string
    message: string
    affectedAreas: string[]
    estimatedResolution?: string
  }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newOutage: Outage = {
      _id: `outage-${Date.now()}`,
      officeId: user!.officeId!,
      postedBy: user!._id,
      title: data.title,
      message: data.message,
      affectedAreas: data.affectedAreas,
      status: "Active",
      estimatedResolution: data.estimatedResolution ? new Date(data.estimatedResolution).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setOutages((prev) => [newOutage, ...prev])
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Manage tickets and assign technicians</p>
        </div>
        <Button
          onClick={() => setOutageDialog(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Outage
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Tickets"
          value={pendingTickets.length}
          icon={<Ticket className="w-5 h-5" />}
          description="Awaiting assignment"
        />
        <StatsCard
          title="Assigned"
          value={assignedTickets.length}
          icon={<Users className="w-5 h-5" />}
          description="With technicians"
        />
        <StatsCard
          title="In Progress"
          value={inProgressTickets.length}
          icon={<Clock className="w-5 h-5" />}
          description="Being worked on"
        />
        <StatsCard
          title="Active Outages"
          value={activeOutages.length}
          icon={<AlertTriangle className="w-5 h-5" />}
          description="In your area"
        />
      </div>

      {/* Technicians Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Available Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {technicians.map((tech) => {
              const assignedCount = tickets.filter(
                (t) => t.assignedTo === tech._id && ["Assigned", "In Progress"].includes(t.status),
              ).length
              return (
                <div key={tech._id} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                    {tech.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-foreground">{tech.fullName}</p>
                    <p className="text-xs text-muted-foreground">{assignedCount} active tickets</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      assignedCount < 3
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30"
                    }
                  >
                    {assignedCount < 3 ? "Available" : "Busy"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Tickets */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Pending Tickets</h2>
        {pendingTickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending tickets. All caught up!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                showCustomer
                onAction={handleTicketAction}
                actions={[{ label: "Assign Technician", action: "assign" }]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Assign Dialog */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog({ open, ticketId: open ? assignDialog.ticketId : null })}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Assign Technician</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a technician to handle this ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech._id} value={tech._id}>
                    {tech.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog({ open: false, ticketId: null })}
              className="border-border text-card-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedTechnician}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Outage Dialog */}
      {user?.officeId && (
        <PostOutageDialog
          open={outageDialog}
          onOpenChange={setOutageDialog}
          onSubmit={handlePostOutage}
          officeId={user.officeId}
        />
      )}
    </div>
  )
}

