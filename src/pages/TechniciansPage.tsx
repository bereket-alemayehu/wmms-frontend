import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, MapPin, Search, Filter, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOffices } from "@/features/offices/hooks/useOffices";
import { useTechniciansByOffice } from "@/features/users/hooks/ getTechnicians";
import { useOfficeTickets } from "@/features/tickets/hooks";
import { CreateUserDialog } from "@/features/users/components/CreateUserDialog";

export function TechniciansPage() {
  const { user } = useAuth();
  const { data: offices = [] } = useOffices();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "busy"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch technicians for the office
  const { data: technicians = [], isLoading: techniciansLoading } = useTechniciansByOffice(user?.officeId);

  // Fetch all office tickets to calculate statistics
  const { data: tickets = [], isLoading: ticketsLoading } = useOfficeTickets();

  if (!user) return null;

  const office = offices.find((o) => o._id === user.officeId);

  // Calculate statistics for each technician
  const techniciansWithStats = useMemo(() => {
    return technicians.map((tech) => {
      const techId = typeof tech._id === 'string' ? tech._id : (tech._id as any)?.toString() || '';

      const assignedTickets = tickets.filter(
        (t: any) => {
          const assignedToId = typeof t.assignedTo === 'string'
            ? t.assignedTo
            : typeof t.assignedTo === 'object' && t.assignedTo?._id
              ? t.assignedTo._id.toString()
              : '';
          return assignedToId === techId && ["Assigned", "In Progress"].includes(t.status);
        }
      );

      const resolvedTickets = tickets.filter(
        (t: any) => {
          const assignedToId = typeof t.assignedTo === 'string'
            ? t.assignedTo
            : typeof t.assignedTo === 'object' && t.assignedTo?._id
              ? t.assignedTo._id.toString()
              : '';
          return assignedToId === techId && ["Resolved", "Closed"].includes(t.status);
        }
      );

      const inProgressTickets = tickets.filter(
        (t: any) => {
          const assignedToId = typeof t.assignedTo === 'string'
            ? t.assignedTo
            : typeof t.assignedTo === 'object' && t.assignedTo?._id
              ? t.assignedTo._id.toString()
              : '';
          return assignedToId === techId && t.status === "In Progress";
        }
      );

      return {
        ...tech,
        assignedCount: assignedTickets.length,
        resolvedCount: resolvedTickets.length,
        inProgressCount: inProgressTickets.length,
        isAvailable: assignedTickets.length < 3,
      };
    });
  }, [technicians, tickets]);

  const filteredTechnicians = useMemo(() => {
    let filtered = techniciansWithStats;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (tech) =>
          tech.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tech.phoneNumber.includes(searchQuery),
      );
    }

    // Filter by status
    if (statusFilter === "available") {
      filtered = filtered.filter((tech) => tech.isAvailable);
    } else if (statusFilter === "busy") {
      filtered = filtered.filter((tech) => !tech.isAvailable);
    }

    return filtered;
  }, [techniciansWithStats, searchQuery, statusFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Technicians</h1>
          <p className="text-muted-foreground">
            Manage and monitor your team of technicians
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filteredTechnicians.length} technician(s)</span>
          </div>
          {(user.role === "manager" || user.role === "supervisor") && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Technician
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search technicians by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className={
              statusFilter === "all"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            All
          </Button>
          <Button
            variant={statusFilter === "available" ? "default" : "outline"}
            onClick={() => setStatusFilter("available")}
            className={
              statusFilter === "available"
                ? "bg-success text-success-foreground hover:bg-success/90"
                : ""
            }
          >
            Available
          </Button>
          <Button
            variant={statusFilter === "busy" ? "default" : "outline"}
            onClick={() => setStatusFilter("busy")}
            className={
              statusFilter === "busy"
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : ""
            }
          >
            Busy
          </Button>
        </div>
      </div>

      {/* Technicians Grid */}
      {techniciansLoading || ticketsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            No technicians found
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : "No technicians are assigned to your office."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTechnicians.map((tech) => (
            <Card
              key={tech._id}
              className="bg-card border-border hover:border-primary/30 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                        {getInitials(tech.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-card-foreground truncate">
                        {tech.fullName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {tech.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      tech.isAvailable
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-warning/20 text-warning border-warning/30",
                    )}
                  >
                    {tech.isAvailable ? "Available" : "Busy"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Office Location */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {office?.branchName ||
                      (typeof tech.officeId === 'object' && (tech.officeId as any)?.branchName) ||
                      office?.cityName ||
                      "Unknown office"}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center p-2 bg-secondary rounded-lg">
                    <p className="text-lg font-bold text-secondary-foreground">
                      {tech.assignedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded-lg">
                    <p className="text-lg font-bold text-secondary-foreground">
                      {tech.inProgressCount}
                    </p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded-lg">
                    <p className="text-lg font-bold text-secondary-foreground">
                      {tech.resolvedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>

                {/* Contact Button */}
                <Button
                  variant="outline"
                  className="w-full border-border text-card-foreground bg-transparent"
                  onClick={() => window.open(`tel:${tech.phoneNumber}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Technician
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Team Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {techniciansWithStats.filter((t) => t.isAvailable).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Available Technicians
              </p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {techniciansWithStats.reduce(
                  (sum, t) => sum + t.assignedCount,
                  0,
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Active Tasks
              </p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-secondary-foreground">
                {techniciansWithStats.reduce(
                  (sum, t) => sum + t.resolvedCount,
                  0,
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Resolved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        role="technician"
        officeId={user.officeId} // If supervisor, pre-select their office
      />
    </div>
  );
}
