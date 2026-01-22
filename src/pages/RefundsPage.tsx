import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRefunds } from "@/features/refunds/hooks/useRefunds";
import { refundsApi } from "@/features/refunds/api/refunds";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState, useEffect } from "react";

const statusColors: Record<string, string> = {
  Approved: "bg-success/20 text-success border-success/30",
  Requested: "bg-warning/20 text-warning border-warning/30",
  Rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

export function RefundsPage() {
  const { user } = useAuth();
  const { refunds, isLoading, error, refresh } = useRefunds();
  const canUpdateStatus = user?.role === "manager";
  const canDelete = user?.role === "manager";
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvalEligibility, setApprovalEligibility] = useState<Record<string, boolean>>({});

  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
    if (!canUpdateStatus) return;
    setActionError(null);
    setActionLoadingId(id);
    try {
      await refundsApi.update(id, { status });
      await refresh();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.message || e?.message || "Failed to update refund",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeRefund = async (id: string) => {
    if (!canDelete) return;
    const ok = window.confirm("Delete this refund?");
    if (!ok) return;
    setActionError(null);
    setActionLoadingId(id);
    try {
      await refundsApi.remove(id);
      await refresh();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.message || e?.message || "Failed to delete refund",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Check approval eligibility for all requested refunds
  useEffect(() => {
    if (!canUpdateStatus || refunds.length === 0) return;

    const checkEligibility = async () => {
      const eligibilityMap: Record<string, boolean> = {};
      for (const refund of refunds) {
        if (refund.status === "Requested") {
          try {
            const result = await refundsApi.canApprove(refund._id);
            eligibilityMap[refund._id] = result.canApprove;
          } catch (e) {
            eligibilityMap[refund._id] = false;
          }
        }
      }
      setApprovalEligibility(eligibilityMap);
    };

    checkEligibility();
  }, [refunds, canUpdateStatus]);

  const totalRefundAmount = refunds
    .filter((r) => r.status === "Approved")
    .reduce((sum, r) => sum + r.amount, 0);
  const refundCount = refunds.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refunds</h1>
          <p className="text-muted-foreground">View all processed refunds</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{refundCount}</p>
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

      {/* Refunds List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Refunds</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            View all processed refunds
          </p>
        </CardHeader>
        <CardContent>
          {actionError && (
            <p className="text-destructive text-sm mb-4">{actionError}</p>
          )}
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading refunds...
            </p>
          ) : error ? (
            <p className="text-destructive text-center py-8">{error}</p>
          ) : refunds.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No refunds processed
            </p>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => {
                const customer = refund.customer;
                const ticket = refund.ticket;
                const isActionLoading = actionLoadingId === refund._id;

                return (
                  <div key={refund._id} className="p-4 bg-secondary rounded-lg">
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
                      {(canUpdateStatus || canDelete) && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {canUpdateStatus && refund.status === "Requested" && (
                            <>
                              <Button
                                size="sm"
                                disabled={
                                  isActionLoading ||
                                  !approvalEligibility[refund._id]
                                }
                                onClick={() =>
                                  updateStatus(refund._id, "Approved")
                                }
                                title={
                                  !approvalEligibility[refund._id]
                                    ? "Ticket must be Closed to approve refund"
                                    : "Approve refund"
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isActionLoading}
                                onClick={() =>
                                  updateStatus(refund._id, "Rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isActionLoading}
                              onClick={() => removeRefund(refund._id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
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
    </div>
  );
}
