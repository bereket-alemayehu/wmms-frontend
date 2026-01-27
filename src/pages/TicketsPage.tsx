import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { TicketCard } from "@/features/tickets/components/ticketCard";
import { CreateTicketDialog } from "@/features/tickets/components/createTicketDialog";
import { EditTicketDialog } from "@/features/tickets/components/editTicketDialog";
import { DeleteConfirmationDialog } from "@/features/tickets/components/deleteConfirmationDialog";
import { useState } from "react";
import {
  useTickets,
  useCustomerTickets,
  useTechnicianTickets,
  useOfficeTickets,
  useDeleteTicket,
} from "@/features/tickets/hooks";
import type { Ticket } from "@/features/tickets/types";
import { AlertTriangle, Ticket as TicketIcon, Loader2 } from "lucide-react";

export function TicketsPage() {
  const { user } = useAuth();

  if (!user) return null;
  const role = user.role;

  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteTicketMutation = useDeleteTicket();

  // Use role-specific hooks - all hooks called unconditionally (Rules of Hooks)
  // But only the relevant one is enabled to avoid unauthorized API calls
  const customerQuery = useCustomerTickets(role === "customer");
  const technicianQuery = useTechnicianTickets(
    undefined,
    role === "technician",
  );
  const officeQuery = useOfficeTickets(undefined, false);
  const staffQuery = useTickets(
    undefined,
    role === "supervisor" || role === "manager",
  );

  // Select the appropriate query based on role
  const {
    data: tickets = [],
    isLoading,
    error,
  } = useMemo(() => {
    if (role === "customer") return customerQuery;
    if (role === "technician") return technicianQuery;
    if (role === "supervisor" || role === "manager") return staffQuery;
    return officeQuery;
  }, [role, customerQuery, technicianQuery, staffQuery, officeQuery]);

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
          ["Resolved", "Closed"].includes(t.status),
        ),
      },
    ];
  }, [role, tickets]);

  const showCustomer = useMemo(
    () => role === "supervisor" || role === "manager",
    [role],
  );

  // Handlers
  const handleAction = (action: string, ticketId: string) => {
    if (action === "edit") {
      const ticket = tickets.find((t) => t._id === ticketId);
      if (ticket) {
        setTicketToEdit(ticket);
        setIsEditDialogOpen(true);
      }
    } else if (action === "delete") {
      setTicketToDelete(ticketId);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (ticketToDelete) {
      deleteTicketMutation.mutate(ticketToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setTicketToDelete(null);
        },
      });
    }
  };

  const getCustomerActions = (ticket: Ticket) => {
    const actions = [];
    if (ticket.status === "Pending" || ticket.status === "Assigned") {
      actions.push({ label: "Edit", action: "edit", variant: "outline" as const });
    }
    if ((ticket.status === "Pending" || ticket.status === "Assigned") && (Date.now() - new Date(ticket.createdAt).getTime() < 10 * 60 * 1000)) {
      actions.push({ label: "Delete", action: "delete", variant: "destructive" as const });
    }
    return actions;
  };

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
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching tickets"}
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
                    onAction={handleAction}
                    actions={role === "customer" ? getCustomerActions(ticket) : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <EditTicketDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        ticket={ticketToEdit}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteTicketMutation.isPending}
        title="Delete Support Ticket"
        description="Are you sure you want to delete this support ticket? This action cannot be undone."
      />
    </div>
  );
}
