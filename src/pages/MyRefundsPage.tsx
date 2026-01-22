import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, Calendar, FileText } from "lucide-react";
import { useRefunds } from "@/features/refunds/hooks/useRefunds";

const statusColors: Record<string, string> = {
  Approved: "bg-success/20 text-success border-success/30",
  Requested: "bg-warning/20 text-warning border-warning/30",
  Rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

export function MyRefundsPage() {
  const { user } = useAuth();
  const { refunds, isLoading, error } = useRefunds();

  if (!user) return null;

  const customerRefunds = refunds.filter((r) => r.customerId === user._id);
  const approvedRefunds = customerRefunds.filter(
    (r) => r.status === "Approved",
  );
  const totalRefundAmount = approvedRefunds.reduce(
    (sum, r) => sum + r.amount,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Refunds</h1>
          <p className="text-muted-foreground">
            View your refund status and details
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {customerRefunds.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Refunds</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {totalRefundAmount} ETB
            </p>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Approved
              </CardTitle>
              <DollarSign className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {approvedRefunds.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Refunds processed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Pending
              </CardTitle>
              <Calendar className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {customerRefunds.filter((r) => r.status === "Requested").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Amount
              </CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-card-foreground">
              {totalRefundAmount} ETB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Approved refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Refunds List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Refund History</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            All your refunds processed automatically
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading refunds...
            </p>
          ) : error ? (
            <p className="text-destructive text-center py-8">{error}</p>
          ) : customerRefunds.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No refunds yet
              </p>
              <p className="text-sm text-muted-foreground">
                Refunds are automatically processed when eligible tickets meet
                the criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerRefunds.map((refund) => {
                const ticket = refund.ticket;
                const refundDate = new Date(
                  refund.createdAt,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const updatedDate =
                  refund.updatedAt !== refund.createdAt
                    ? new Date(refund.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null;

                return (
                  <div
                    key={refund._id}
                    className="p-4 bg-secondary rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium text-sm",
                              statusColors[refund.status] ||
                                "bg-secondary text-secondary-foreground border-border",
                            )}
                          >
                            {refund.status}
                          </Badge>
                          <span className="text-xl font-bold text-secondary-foreground">
                            {refund.amount} ETB
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {refundDate}
                          </p>
                        </div>
                      </div>

                      {/* Ticket Info */}
                      {ticket && (
                        <div className="space-y-1 pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-secondary-foreground">
                              Ticket Category:
                            </span>{" "}
                            {ticket.category}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Ticket #{refund.ticketId.slice(-8).toUpperCase()}
                          </p>
                          {ticket.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {ticket.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created: {refundDate}
                        </span>
                        {updatedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Updated: {updatedDate}
                          </span>
                        )}
                      </div>

                      {/* Admin Comment */}
                      {refund.adminComment && (
                        <div className="mt-2 p-3 bg-card rounded border border-border">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-card-foreground mb-1">
                                Note:
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {refund.adminComment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
