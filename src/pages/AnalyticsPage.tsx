import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, TrendingUp, Users } from "lucide-react";
import { mockTickets, mockUsers } from "@/lib/mock-data";

export function AnalyticsPage() {
  const totalTickets = mockTickets.length;
  const resolvedTickets = mockTickets.filter((t) =>
    ["Resolved", "Closed"].includes(t.status)
  ).length;
  const pendingTickets = mockTickets.filter(
    (t) => t.status === "Pending"
  ).length;
  const inProgressTickets = mockTickets.filter(
    (t) => t.status === "In Progress"
  ).length;
  const resolutionRate =
    totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

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
              {["No Connection", "Speed Issue", "Hardware Fault", "Other"].map(
                (category) => {
                  const count = mockTickets.filter(
                    (t) => t.category === category
                  ).length;
                  const percentage =
                    totalTickets > 0
                      ? Math.round((count / totalTickets) * 100)
                      : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-card-foreground">{category}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
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
              {mockUsers
                .filter((u) => u.role === "technician")
                .map((tech) => {
                  const resolved = mockTickets.filter(
                    (t) =>
                      t.assignedTo === tech._id &&
                      ["Resolved", "Closed"].includes(t.status)
                  ).length;
                  const assigned = mockTickets.filter(
                    (t) =>
                      t.assignedTo === tech._id &&
                      ["Assigned", "In Progress"].includes(t.status)
                  ).length;
                  return (
                    <div
                      key={tech._id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                          {tech.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-secondary-foreground block">
                            {tech.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {assigned} active
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-foreground">
                          {resolved} resolved
                        </p>
                        <p className="text-xs text-muted-foreground">
                          this month
                        </p>
                      </div>
                    </div>
                  );
                })}
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
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {mockTickets.filter((t) => t.status === "Pending").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {mockTickets.filter((t) => t.status === "Assigned").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Assigned</p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {mockTickets.filter((t) => t.status === "In Progress").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {mockTickets.filter((t) => t.status === "Resolved").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {mockTickets.filter((t) => t.status === "Closed").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
