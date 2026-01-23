import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, TrendingUp, Users, Loader2 } from "lucide-react";
import { useSystemAnalytics } from "@/features/tickets/hooks";

export function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useSystemAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const {
    totalTickets,
    resolvedTickets,
    pendingTickets,
    inProgressTickets,
    resolutionRate,
    ticketsByCategory,
    ticketsByStatus,
    technicianPerformance,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          System-wide performance metrics and insights
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Tickets
              </CardTitle>
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {totalTickets}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Resolution Rate
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {resolutionRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {resolvedTickets} resolved
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Pending
              </CardTitle>
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {pendingTickets}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                In Progress
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {inProgressTickets}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Being worked on
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground text-base">
              Tickets by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticketsByCategory.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-card-foreground">{item.category}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground text-base">
              Technician Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {technicianPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No technicians found
                </p>
              ) : (
                technicianPerformance.map((tech) => {
                  const initials = tech.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <div
                      key={tech.technicianId}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                          {initials}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-secondary-foreground block">
                            {tech.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tech.activeCount} active
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-foreground">
                          {tech.resolvedThisMonth} resolved
                        </p>
                        <p className="text-xs text-muted-foreground">
                          this month
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Status Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground text-base">
            Ticket Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ticketsByStatus.map((statusItem) => (
              <div key={statusItem.status} className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold text-secondary-foreground">
                  {statusItem.count}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{statusItem.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
