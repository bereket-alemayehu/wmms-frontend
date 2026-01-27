import { useMemo } from "react";
import { StatsCard } from "./stats-card";
import { Wrench, CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  useTechnicianTickets,
  useTechnicianStatistics,
  useChangeTicketStatus,
} from "@/features/tickets/hooks";
import { TicketCard } from "@/features/tickets/components/ticketCard";

export function TechnicianDashboard() {
  // Fetch technician statistics (summary data)
  const { data: stats } = useTechnicianStatistics();

  // Fetch only active tickets (Assigned and In Progress) for dashboard preview
  const { data: allTickets = [], isLoading: ticketsLoading } =
    useTechnicianTickets();
  const changeStatusMutation = useChangeTicketStatus();

  // Filter to show only active tasks on dashboard (not resolved/closed)
  const activeTickets = useMemo(
    () =>
      allTickets.filter((t) => ["Assigned", "In Progress"].includes(t.status)),
    [allTickets],
  );

  const handleStatusChange = async (
    ticketId: string,
    newStatus: "In Progress" | "Resolved",
  ) => {
    changeStatusMutation.mutate({
      ticketId,
      status: newStatus,
    });
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
          value={stats?.assigned ?? 0}
          icon={<Wrench className="w-5 h-5" />}
          description="Waiting to start"
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress ?? 0}
          icon={<Clock className="w-5 h-5" />}
          description="Currently working"
        />
        <StatsCard
          title="Completed Today"
          value={stats?.completedToday ?? 0}
          icon={<CheckCircle className="w-5 h-5" />}
          description="Great job!"
        />
      </div>

      {/* Active Tasks Preview - Show only first 3 active tasks */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Active Tasks
        </h2>
        {ticketsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No active tasks. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.slice(0, 3).map((ticket) => (
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
            {activeTickets.length > 3 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 3 of {activeTickets.length} active tasks.{" "}
                  <a
                    href="/dashboard/tasks"
                    className="text-primary hover:underline"
                  >
                    View all tasks →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
