import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { TicketCard } from "@/features/tickets/components/ticketCard";
import { CreateTicketDialog } from "@/features/tickets/components/createTicketDialog";
import { 
  useTickets, 
  useCustomerTickets, 
  useTechnicianTickets, 
  useOfficeTickets 
} from "@/features/tickets/hooks";
import { AlertTriangle, Ticket as TicketIcon, Loader2 } from "lucide-react";

export function TicketsPage() {
  const { user } = useAuth();
  
  if (!user) return null;
  const role = user.role;

  // Use role-specific hooks - all hooks called unconditionally (Rules of Hooks)
  // But only the relevant one is enabled to avoid unauthorized API calls
  const customerQuery = useCustomerTickets(role === "customer");
  const technicianQuery = useTechnicianTickets(undefined, role === "technician");
  const officeQuery = useOfficeTickets(undefined, role === "supervisor" || role === "manager");
  const managerQuery = useTickets(undefined, role === "manager");

  // Select the appropriate query based on role
  const { data: tickets = [], isLoading, error } = useMemo(() => {
    if (role === "customer") return customerQuery;
    if (role === "technician") return technicianQuery;
    if (role === "supervisor" || role === "manager") return officeQuery;
    return managerQuery;
  }, [role, customerQuery, technicianQuery, officeQuery, managerQuery]);

  const sections = useMemo(() => {
    if (role === "customer") {
      return [{ title: "Your Tickets", tickets }];
    }
    return [
      {
        title: "Pending",
        tickets: tickets.filter((t) => t.status === "Pending"),
      },
      {
        title: "Assigned",
        tickets: tickets.filter((t) => t.status === "Assigned"),
      },
      {
        title: "In Progress",
        tickets: tickets.filter((t) => t.status === "In Progress"),
      },
      {
        title: "Resolved / Closed",
        tickets: tickets.filter((t) =>
          ["Resolved", "Closed"].includes(t.status)
        ),
      },
    ];
  }, [role, tickets]);

  const showCustomer = useMemo(
    () => role === "supervisor" || role === "manager",
    [role]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-semibold">Failed to load tickets</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred while fetching tickets"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground">
            Track and manage support requests
          </p>
        </div>
        {role === "customer" ? (
          <CreateTicketDialog />
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TicketIcon className="w-4 h-4" />
            {tickets.length} ticket(s)
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {section.title}
              </h2>
              {section.tickets.length === 0 && (
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {section.tickets.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
                No tickets in this section.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {section.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    showQueue={role === "customer"}
                    showCustomer={showCustomer}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
