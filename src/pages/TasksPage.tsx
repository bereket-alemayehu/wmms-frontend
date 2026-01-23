import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
  Filter,
  Loader2,
} from "lucide-react";
import { useTechnicianTickets, useChangeTicketStatus } from "@/features/tickets/hooks";
import { TicketCard } from "@/features/tickets/components/ticketCard";

export function TasksPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all tickets assigned to technician
  const { data: tickets = [], isLoading } = useTechnicianTickets();
  const changeStatusMutation = useChangeTicketStatus();

  if (!user) return null;

  const assignedTickets = useMemo(
    () => tickets.filter((t) => t.status === "Assigned"),
    [tickets]
  );
  
  const inProgressTickets = useMemo(
    () => tickets.filter((t) => t.status === "In Progress"),
    [tickets]
  );
  
  const resolvedTickets = useMemo(
    () => tickets.filter((t) => ["Resolved", "Closed"].includes(t.status)),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    switch (activeTab) {
      case "assigned":
        return assignedTickets;
      case "in-progress":
        return inProgressTickets;
      case "resolved":
        return resolvedTickets;
      default:
        return tickets.filter((t) =>
          ["Assigned", "In Progress"].includes(t.status),
        );
    }
  }, [activeTab, tickets, assignedTickets, inProgressTickets, resolvedTickets]);

  const handleStatusChange = (
    ticketId: string,
    newStatus: "In Progress" | "Resolved",
  ) => {
    changeStatusMutation.mutate({
      ticketId,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all your assigned tickets
          </p>
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
          <TabsTrigger value="assigned">
            Assigned ({assignedTickets.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Wrench className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No tasks found
              </p>
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
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  showCustomer
                  onAction={(action, ticketId) => {
                    if (action === "start") {
                      handleStatusChange(ticketId, "In Progress");
                    } else if (action === "resolve") {
                      handleStatusChange(ticketId, "Resolved");
                    }
                  }}
                  actions={[
                    ...(ticket.status === "Assigned"
                      ? [{ label: "Start Working", action: "start" }]
                      : []),
                    ...(ticket.status === "In Progress"
                      ? [{ label: "Mark Resolved", action: "resolve" }]
                      : []),
                  ]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
