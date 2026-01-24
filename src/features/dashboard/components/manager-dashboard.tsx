import { StatsCard } from "./stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Clock,
  DollarSign,
  Star,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { useTickets, useTopRatedTechnicians } from "@/features/tickets/hooks";
import { useRefunds } from "@/features/refunds/hooks/useRefunds";
import { useOutages } from "@/features/outages/hooks/useOutages";
import { useOffices } from "@/features/offices/hooks/useOffices";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Approved: "bg-success/20 text-success border-success/30",
  Processed: "bg-primary/20 text-primary border-primary/30",
};

const pieColors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

export function ManagerDashboard() {
  const { data: tickets = [] } = useTickets();
  const { refunds } = useRefunds();
  const { data: outages = [] } = useOutages();
  const { data: offices = [] } = useOffices();
  const { data: topRatedTechniciansData = [] } = useTopRatedTechnicians(3);

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((t) =>
    ["Resolved", "Closed"].includes(t.status),
  );
  const resolvedCount = resolvedTickets.length;
  const resolutionRate =
    totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

  const approvedRefunds = refunds.filter((r) => r.status === "Approved");
  const refundCount = refunds.length;
  const approvedRefundCount = approvedRefunds.length;
  const totalRefundAmount = approvedRefunds.reduce(
    (sum, r) => sum + r.amount,
    0,
  );
  const refundRate =
    totalTickets > 0
      ? Math.round((approvedRefundCount / totalTickets) * 100)
      : 0;

  const statusOrder = [
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
  ] as const;
  const ticketStatusCounts = statusOrder.map((status) => ({
    status,
    count: tickets.filter((t) => t.status === status).length,
  }));

  const avgResolutionMs = resolvedCount
    ? resolvedTickets.reduce(
        (sum, t) =>
          sum +
          (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()),
        0,
      ) / resolvedCount
    : 0;
  const avgResolutionDays = avgResolutionMs
    ? avgResolutionMs / (1000 * 60 * 60 * 24)
    : 0;

  const ratings = tickets.filter((t) => typeof t.rating === "number");
  const feedbackCount = ratings.length;
  const avgRating = feedbackCount
    ? Math.round(
        (ratings.reduce((sum, t) => sum + (t.rating || 0), 0) / feedbackCount) *
          10,
      ) / 10
    : 0;
  const ratingDistribution = [1, 2, 3, 4, 5].map((value) => ({
    value,
    count: ratings.filter((t) => t.rating === value).length,
  }));

  const ticketOfficeMap = new Map(tickets.map((t) => [t._id, t.officeId]));

  const officePerformance = offices.map((office) => {
    const officeTickets = tickets.filter((t) => t.officeId === office._id);
    const officeResolved = officeTickets.filter((t) =>
      ["Resolved", "Closed"].includes(t.status),
    ).length;
    const officeRefunds = refunds.filter(
      (r) => ticketOfficeMap.get(r.ticketId) === office._id,
    );
    const officeRefundApproved = officeRefunds.filter(
      (r) => r.status === "Approved",
    ).length;

    return {
      office,
      tickets: officeTickets.length,
      resolutionRate: officeTickets.length
        ? Math.round((officeResolved / officeTickets.length) * 100)
        : 0,
      refundRate: officeTickets.length
        ? Math.round((officeRefundApproved / officeTickets.length) * 100)
        : 0,
    };
  });

  const outageMetrics = offices.map((office) => {
    const officeOutages = outages.filter((o) => o.officeId === office._id);
    const resolvedOutages = officeOutages.filter(
      (o) => o.status === "Resolved",
    );
    const avgOutageMs = resolvedOutages.length
      ? resolvedOutages.reduce(
          (sum, o) =>
            sum +
            (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()),
          0,
        ) / resolvedOutages.length
      : 0;

    return {
      office,
      outageCount: officeOutages.length,
      avgResolutionDays: avgOutageMs ? avgOutageMs / (1000 * 60 * 60 * 24) : 0,
    };
  });

  const technicians = Array.from(
    tickets
      .reduce((map, ticket) => {
        if (ticket.technician) {
          map.set(ticket.technician._id, ticket.technician);
        } else if (ticket.assignedTo) {
          const id = ticket.assignedTo;
          const fallback = {
            _id: id,
            fullName: `Tech ${id.slice(-4)}`,
            phoneNumber: "",
          };
          map.set(id, map.get(id) || fallback);
        }
        return map;
      }, new Map<string, { _id: string; fullName: string; phoneNumber?: string }>())
      .values(),
  );
  const technicianWorkload = technicians.map((tech) => {
    const assignedTickets = tickets.filter((t) => t.assignedTo === tech._id);
    const resolvedAssigned = assignedTickets.filter((t) =>
      ["Resolved", "Closed"].includes(t.status),
    );
    const avgResolveMs = resolvedAssigned.length
      ? resolvedAssigned.reduce(
          (sum, t) =>
            sum +
            (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()),
          0,
        ) / resolvedAssigned.length
      : 0;

    return {
      tech,
      assignedCount: assignedTickets.length,
      resolvedCount: resolvedAssigned.length,
      avgResolutionDays: avgResolveMs
        ? avgResolveMs / (1000 * 60 * 60 * 24)
        : 0,
    };
  });

  // Map backend top-rated technicians data to the format expected by the UI
  const topRatedTechnicians = topRatedTechniciansData.map((techData) => ({
    tech: {
      _id: techData.technicianId,
      fullName: techData.fullName,
    },
    average: techData.averageRating,
    count: techData.ratingCount,
  }));

  const getDayKey = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 10);
  };

  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d.toISOString().slice(0, 10);
  });

  const refundsByDay = last7Days.map((day) => {
    const dayRefunds = refunds.filter((r) => getDayKey(r.createdAt) === day);
    return {
      day,
      Requested: dayRefunds.filter((r) => r.status === "Requested").length,
      Approved: dayRefunds.filter((r) => r.status === "Approved").length,
      Rejected: dayRefunds.filter((r) => r.status === "Rejected").length,
    };
  });

  const ticketsByDay = last7Days.map((day) => ({
    day,
    Created: tickets.filter((t) => getDayKey(t.createdAt) === day).length,
  }));

  const getWeekKey = (dateStr: string) => {
    const d = new Date(dateStr);
    const firstDay = new Date(d.getFullYear(), 0, 1);
    const dayOfYear =
      Math.floor((d.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    const week = Math.ceil(dayOfYear / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  const recentWeeks = Array.from({ length: 4 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - idx * 7);
    return getWeekKey(d.toISOString());
  }).reverse();

  const refundsByWeek = recentWeeks.map((week) => {
    const weekRefunds = refunds.filter((r) => getWeekKey(r.createdAt) === week);
    return {
      week,
      Requested: weekRefunds.filter((r) => r.status === "Requested").length,
      Approved: weekRefunds.filter((r) => r.status === "Approved").length,
      Rejected: weekRefunds.filter((r) => r.status === "Rejected").length,
    };
  });

  const refundStatusSummary = [
    {
      name: "Requested",
      value: refunds.filter((r) => r.status === "Requested").length,
    },
    {
      name: "Approved",
      value: refunds.filter((r) => r.status === "Approved").length,
    },
    {
      name: "Rejected",
      value: refunds.filter((r) => r.status === "Rejected").length,
    },
  ];

  const officePerformanceChart = officePerformance.map((row) => ({
    name: row.office.branchName,
    Tickets: row.tickets,
    Resolution: row.resolutionRate,
    Refunds: row.refundRate,
  }));

  const outageChart = outageMetrics.map((row) => ({
    name: row.office.branchName,
    Outages: row.outageCount,
    "Avg Days": Math.round(row.avgResolutionDays * 10) / 10,
  }));

  const technicianWorkloadChart = technicianWorkload.map((row) => ({
    name: row.tech.fullName.split(" ")[0],
    Assigned: row.assignedCount,
    Resolved: row.resolvedCount,
    "Avg Days": Math.round(row.avgResolutionDays * 10) / 10,
  }));

  const ticketStatusRadar = ticketStatusCounts.map((row) => ({
    status: row.status,
    count: row.count,
  }));

  const resolutionRings = [
    { name: "Resolution", value: resolutionRate, fill: "#34d399" },
    { name: "Refund Rate", value: refundRate, fill: "#fbbf24" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of operations and financials
        </p>
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
          value={`${resolutionRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Total Refunds"
          value={refundCount}
          icon={<DollarSign className="w-5 h-5" />}
          description={`${approvedRefundCount} approved • ${refundRate}% rate`}
        />
        <StatsCard
          title="Total Refunded"
          value={`${totalRefundAmount} ETB`}
          icon={<BarChart3 className="w-5 h-5" />}
          description="Approved refunds"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="refunds" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger
            value="refunds"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Refunds
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
              <CardTitle className="text-card-foreground">Refunds</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View all processed refunds
              </p>
            </CardHeader>
            <CardContent>
              {refunds.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No refunds processed
                </p>
              ) : (
                <div className="space-y-4">
                  {refunds.map((refund) => {
                    const customer = refund.customer;
                    const ticket = refund.ticket;

                    return (
                      <div
                        key={refund._id}
                        className="p-4 bg-secondary rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={cn(
                                statusColors[refund.status] ||
                                  "bg-secondary text-secondary-foreground border-border",
                              )}
                            >
                              {refund.status}
                            </Badge>
                            <span className="text-sm font-medium text-secondary-foreground">
                              {refund.amount} ETB
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {customer?.fullName || "Unknown customer"} •{" "}
                            {ticket?.category || "Unknown category"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Ticket #{refund.ticketId.slice(-8).toUpperCase()}
                          </p>
                          {refund.adminComment && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              {refund.adminComment}
                            </p>
                          )}
                        </div>
                      </div>
                    );
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
                <CardTitle className="text-card-foreground text-base">
                  Ticket Volume by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketStatusCounts} margin={{ left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#60a5fa"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Avg resolution time:{" "}
                  {avgResolutionDays
                    ? avgResolutionDays.toFixed(1)
                    : "0.0"}{" "}
                  days
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Refund Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={24} />
                        <Pie
                          data={refundStatusSummary}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={70}
                          innerRadius={40}
                          paddingAngle={4}
                        >
                          {refundStatusSummary.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Total Refunds
                      </p>
                      <p className="text-lg font-semibold text-secondary-foreground">
                        {refundCount}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">Approved</p>
                      <p className="text-lg font-semibold text-secondary-foreground">
                        {approvedRefundCount}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Total Refunded
                      </p>
                      <p className="text-lg font-semibold text-secondary-foreground">
                        {totalRefundAmount} ETB
                      </p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Refund Rate
                      </p>
                      <p className="text-lg font-semibold text-secondary-foreground">
                        {refundRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Refunds by Status (Daily)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={refundsByDay} margin={{ left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Requested"
                        stroke="#60a5fa"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Approved"
                        stroke="#34d399"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Rejected"
                        stroke="#f87171"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Refunds by Status (Weekly)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={refundsByWeek} margin={{ left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Requested" stackId="a" fill="#60a5fa" />
                      <Bar dataKey="Approved" stackId="a" fill="#34d399" />
                      <Bar dataKey="Rejected" stackId="a" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Ticket Volume Trend (Area)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ticketsByDay} margin={{ left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="Created"
                        stroke="#60a5fa"
                        fill="#60a5fa"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Ticket Status Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={ticketStatusRadar} outerRadius={80}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="status"
                        tick={{ fontSize: 11 }}
                      />
                      <PolarRadiusAxis angle={30} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Radar
                        name="Tickets"
                        dataKey="count"
                        stroke="#34d399"
                        fill="#34d399"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Resolution vs Refund Rate (Radial)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="35%"
                      outerRadius="90%"
                      data={resolutionRings}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Tooltip />
                      <Legend iconSize={10} layout="vertical" align="right" />
                      <RadialBar dataKey="value" background />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Office Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={officePerformanceChart}
                      margin={{ left: -8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="Tickets"
                        fill="#60a5fa"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="Resolution"
                        fill="#34d399"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="Refunds"
                        fill="#fbbf24"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Outage Frequency & Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outageChart} margin={{ left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="Outages"
                        fill="#f87171"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="Avg Days"
                        fill="#a78bfa"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Technician Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={technicianWorkloadChart}
                      margin={{ left: -8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="Assigned"
                        fill="#60a5fa"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="Resolved"
                        fill="#34d399"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="Avg Days"
                        fill="#fbbf24"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-base">
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Average Rating
                    </p>
                    <p className="text-lg font-semibold text-secondary-foreground flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning" /> {avgRating}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Feedback Count
                    </p>
                    <p className="text-lg font-semibold text-secondary-foreground">
                      {feedbackCount}
                    </p>
                  </div>
                </div>
                <div className="h-52 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDistribution} margin={{ left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="value" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#fbbf24"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-base">
                Top-rated Technicians
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topRatedTechnicians.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No ratings submitted yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topRatedTechnicians.map((row, index) => (
                    <div
                      key={row.tech._id}
                      className="p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-secondary-foreground">
                            {row.tech.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.count} ratings
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            {row.average}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Rank #{index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
