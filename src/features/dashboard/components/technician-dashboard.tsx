import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatsCard } from "./stats-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, CheckCircle, Clock, MapPin, Phone, User } from "lucide-react";
import { mockTickets, mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useOffices } from "@/features/offices/hooks/useOffices";

const statusColors: Record<string, string> = {
  Assigned: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "In Progress": "bg-primary/20 text-primary border-primary/30",
};

export function TechnicianDashboard() {
  const { user } = useAuth();
  const { data: offices = [] } = useOffices();
  const [tickets, setTickets] = useState(
    mockTickets.filter(
      (t) =>
        t.assignedTo === user?._id &&
        ["Assigned", "In Progress"].includes(t.status),
    ),
  );

  const assignedTickets = tickets.filter((t) => t.status === "Assigned");
  const inProgressTickets = tickets.filter((t) => t.status === "In Progress");

  const handleStatusChange = (
    ticketId: string,
    newStatus: "In Progress" | "Resolved",
  ) => {
    if (newStatus === "Resolved") {
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    } else {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId
            ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground">
          View and manage your assigned tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned"
          value={assignedTickets.length}
          icon={<Wrench className="w-5 h-5" />}
          description="Waiting to start"
        />
        <StatsCard
          title="In Progress"
          value={inProgressTickets.length}
          icon={<Clock className="w-5 h-5" />}
          description="Currently working"
        />
        <StatsCard
          title="Completed Today"
          value={3}
          icon={<CheckCircle className="w-5 h-5" />}
          description="Great job!"
        />
      </div>

      {/* Task List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Active Tasks
        </h2>
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No active tasks. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const customer = mockUsers.find(
                (u) => u._id === ticket.customerId,
              );
              const office = offices.find((o) => o._id === ticket.officeId);

              return (
                <Card key={ticket._id} className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              statusColors[ticket.status],
                            )}
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-secondary text-secondary-foreground border-border"
                          >
                            {ticket.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          #{ticket._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ticket.description && (
                      <p className="text-sm text-card-foreground">
                        {ticket.description}
                      </p>
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
                          <p className="text-sm text-muted-foreground">
                            Service #: {customer.serviceNumber}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {office?.location || "Unknown location"}
                    </p>
                  </CardContent>
                  <CardFooter className="gap-2">
                    {ticket.status === "Assigned" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(ticket._id, "In Progress")
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Start Working
                      </Button>
                    )}
                    {ticket.status === "In Progress" && (
                      <Button
                        onClick={() =>
                          handleStatusChange(ticket._id, "Resolved")
                        }
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-border text-card-foreground bg-transparent"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
