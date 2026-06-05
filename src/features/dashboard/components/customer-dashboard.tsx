import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatsCard } from "./stats-card";
import { TicketCard } from "@/features/tickets/components/ticketCard";
import { OutageCard } from "@/features/outages/components/outage-card";
import { CreateTicketDialog } from "@/features/tickets/components/createTicketDialog";
import { useCustomerTickets, useResolutionEstimation } from "@/features/tickets/hooks";
import { useRefunds } from "@/features/refunds/hooks/useRefunds";
import { useOutages } from "@/features/outages/hooks";
import {
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CustomerDashboard() {
  const { user } = useAuth();

  // Fetch customer's own tickets using specific backend route
  const { data: tickets = [], isLoading } = useCustomerTickets();

  // Fetch customer's refunds (backend automatically filters by logged-in user)
  const { refunds: customerRefunds = [], isLoading: refundsLoading } = useRefunds();

  // Fetch outages for the customer's office
  const { data: outages = [], isLoading: outagesLoading } = useOutages(user?.officeId);

  // Fetch resolution estimation
  const { data: estimation } = useResolutionEstimation(user?.officeId);

  // Calculate stats
  const openTickets = useMemo(
    () => tickets.filter((t) => !["Resolved", "Closed"].includes(t.status)),
    [tickets]
  );

  const resolvedTickets = useMemo(
    () => tickets.filter((t) => ["Resolved", "Closed"].includes(t.status)),
    [tickets]
  );

  // Filter active outages
  const activeOutages = useMemo(
    () => outages.filter((o) => o.status === "Active"),
    [outages]
  );

  // Calculate refund stats
  const approvedRefunds = useMemo(
    () => customerRefunds.filter((r) => r.status === "Approved"),
    [customerRefunds]
  );

  const totalRefundAmount = useMemo(
    () => approvedRefunds.reduce((sum, r) => sum + r.amount, 0),
    [approvedRefunds]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.fullName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Track your support tickets and service status
          </p>
        </div>
        <CreateTicketDialog />
      </div>

      {/* Active Outages Banner */}
      {activeOutages.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Active Service Outages</span>
          </div>
          <p className="text-sm text-muted-foreground">
            There are {activeOutages.length} active outage(s) in your area that
            may affect your service.
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
          value={estimation ? `${estimation.estimatedTimeDays} days` : "2.5 days"}
          icon={<Clock className="w-5 h-5" />}
          description="Avg. resolution time"
        />
        <StatsCard
          title="My Refunds"
          value={customerRefunds.length}
          icon={<DollarSign className="w-5 h-5" />}
          description={`${totalRefundAmount} ETB total`}
        />
      </div>

      {/* Active Outages Section */}
      {activeOutages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Service Outages
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeOutages.map((outage) => (
              <OutageCard key={outage._id} outage={outage} />
            ))}
          </div>
        </section>
      )}

      {/* My Refunds Section */}
      {customerRefunds.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            My Refunds
          </h2>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-base">
                Refund History
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View your refund status and details
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerRefunds.map((refund) => {
                  const ticket = tickets.find((t) => t._id === refund.ticketId);
                  const refundDate = new Date(
                    refund.createdAt
                  ).toLocaleDateString();
                  const statusColors: Record<string, string> = {
                    Approved: "bg-success/20 text-success border-success/30",
                    Requested: "bg-warning/20 text-warning border-warning/30",
                    Rejected:
                      "bg-destructive/20 text-destructive border-destructive/30",
                  };

                  return (
                    <div
                      key={refund._id}
                      className="p-4 bg-secondary rounded-lg border border-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                statusColors[refund.status] ||
                                "bg-secondary text-secondary-foreground border-border"
                              )}
                            >
                              {refund.status}
                            </Badge>
                            <span className="text-lg font-bold text-secondary-foreground">
                              {refund.amount} ETB
                            </span>
                          </div>
                          {ticket && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-secondary-foreground">
                                  Ticket:
                                </span>{" "}
                                {ticket.category}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                Ticket #
                                {refund.ticketId.slice(-8).toUpperCase()}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Processed: {refundDate}</span>
                            {refund.updatedAt !== refund.createdAt && (
                              <span>
                                Updated:{" "}
                                {new Date(
                                  refund.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {refund.adminComment && (
                            <div className="mt-2 p-2 bg-card rounded border border-border">
                              <p className="text-xs font-medium text-card-foreground mb-1">
                                Note:
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                {refund.adminComment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Tickets */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your Tickets
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No tickets yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} showQueue />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
