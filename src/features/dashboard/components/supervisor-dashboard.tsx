import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatsCard } from "./stats-card";
import { TicketCard } from "@/features/tickets/components/ticketCard";
import { useOfficeTickets, useAssignTicket } from "@/features/tickets/hooks";
import { useOutages } from "@/features/outages/hooks";
import { useTechniciansByOffice } from "@/features/users/hooks/ getTechnicians";
import { useCreateOutage } from "@/features/outages/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ticket,
  Users,
  AlertTriangle,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { PostOutageDialog } from "@/features/outages/components/post-outage-dialog";

export function SupervisorDashboard() {
  const { user } = useAuth();

  // Fetch office tickets using specific backend route (officeId is determined by backend from auth token)
  const { data: tickets = [], isLoading: ticketsLoading } = useOfficeTickets();
  const assignTicketMutation = useAssignTicket();

  // Fetch outages for the office
  const { data: outages = [] } = useOutages(user?.officeId);

  // Fetch technicians for the office
  const { data: technicians = [], isLoading: techniciansLoading } =
    useTechniciansByOffice(user?.officeId);

  // Create outage mutation
  const createOutageMutation = useCreateOutage();

  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    ticketId: string | null;
  }>({
    open: false,
    ticketId: null,
  });
  const [outageDialog, setOutageDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const pendingTickets = useMemo(
    () => tickets.filter((t) => t.status === "Pending"),
    [tickets],
  );

  const assignedTickets = useMemo(
    () => tickets.filter((t) => t.status === "Assigned"),
    [tickets],
  );

  const inProgressTickets = useMemo(
    () => tickets.filter((t) => t.status === "In Progress"),
    [tickets],
  );

  const activeOutages = useMemo(
    () => outages.filter((o) => o.status === "Active"),
    [outages],
  );

  const handleAssign = () => {
    if (!assignDialog.ticketId || !selectedTechnician) return;

    assignTicketMutation.mutate(
      {
        ticketId: assignDialog.ticketId,
        data: { technicianId: selectedTechnician },
      },
      {
        onSuccess: () => {
          setAssignDialog({ open: false, ticketId: null });
          setSelectedTechnician("");
        },
      },
    );
  };

  const handleTicketAction = (action: string, ticketId: string) => {
    if (action === "assign") {
      setAssignDialog({ open: true, ticketId });
    }
  };

  const handlePostOutage = async (data: {
    title: string;
    message: string;
    affectedAreas: string[];
    estimatedResolution?: string;
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      createOutageMutation.mutate(data, {
        onSuccess: () => {
          setOutageDialog(false);
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage tickets and assign technicians
          </p>
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
          <CardTitle className="text-card-foreground">
            Available Technicians
          </CardTitle>
        </CardHeader>
        <CardContent>
          {techniciansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : technicians.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No technicians available in this office
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {technicians.map((tech) => {
                const assignedCount = tickets.filter(
                  (t) =>
                    t.assignedTo === tech._id &&
                    ["Assigned", "In Progress"].includes(t.status),
                ).length;
                return (
                  <div
                    key={tech._id}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                      {tech.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-foreground">
                        {tech.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignedCount} active tickets
                      </p>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Tickets */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Pending Tickets
        </h2>
        {ticketsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pendingTickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No pending tickets. All caught up!
            </p>
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
        onOpenChange={(open) =>
          setAssignDialog({
            open,
            ticketId: open ? assignDialog.ticketId : null,
          })
        }
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Assign Technician
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a technician to handle this ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedTechnician}
              onValueChange={setSelectedTechnician}
            >
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
              disabled={!selectedTechnician || assignTicketMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {assignTicketMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
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
  );
}
