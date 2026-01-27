/**
 * Ticket Detail Page
 * Full-page view of ticket details with role-based interactions
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteConfirmationDialog } from "@/features/tickets/components"
import {
  Clock,
  MapPin,
  User,
  FileText,
  Star,
  MessageSquare,
  Loader2,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  History,
} from "lucide-react"
import type { TicketStatus } from "@/features/tickets/types"
import {
  useTicket,
  useTicketQueuePosition,
  useRefundEligibility,
  useRequestRefund,
  useSubmitFeedback,
  useUpdateTicket,
  useDeleteTicket,
  useChangeTicketStatus,
  useConfirmResolution,
  useMarkNotResolved,
} from "@/features/tickets/hooks"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  Pending: "bg-warning/20 text-warning border-warning/30",
  Assigned: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "In Progress": "bg-primary/20 text-primary border-primary/30",
  Resolved: "bg-success/20 text-success border-success/30",
  Closed: "bg-muted text-muted-foreground border-border",
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch ticket data and related information
  const { data: ticket, isLoading, isError, error } = useTicket(id!)
  const { data: queueData } = useTicketQueuePosition(id!)
  const { data: refundData } = useRefundEligibility(id!)

  // Mutation hooks
  const updateTicketMutation = useUpdateTicket()
  const changeStatusMutation = useChangeTicketStatus()
  const submitFeedbackMutation = useSubmitFeedback()
  const requestRefundMutation = useRequestRefund()
  const confirmResolutionMutation = useConfirmResolution()
  const markNotResolvedMutation = useMarkNotResolved()
  const deleteTicketMutation = useDeleteTicket()

  // UI state
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Set initial description when ticket loads
  useEffect(() => {
    if (ticket) {
      setNewDescription(ticket.description || "")
    }
  }, [ticket])

  if (!id) {
    navigate("/dashboard/tickets")
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error Loading Ticket
            </CardTitle>
            <CardDescription>
              {(error as any)?.response?.data?.message || "Failed to load ticket details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard/tickets")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Role-based permissions
  const isCustomer = user?.role === "customer"
  const isTechnician = user?.role === "technician"
  const isSupervisor = user?.role === "supervisor"
  const isManager = user?.role === "manager"

  const canUpdate = isSupervisor || isManager || isTechnician || (isCustomer && ["Pending", "Assigned"].includes(ticket.status))
  const canChangeStatus = isTechnician || isSupervisor || isManager
  const canSubmitFeedback = isCustomer && (ticket.status === "Resolved" || ticket.status === "Closed") && !ticket.rating

  // Date calculations
  const createdDate = new Date(ticket.createdAt)
  const updatedDate = new Date(ticket.updatedAt)
  const daysOpen = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  // Handlers
  const handleUpdateDescription = () => {
    if (!newDescription.trim()) {
      toast.error("Description cannot be empty")
      return
    }

    updateTicketMutation.mutate(
      { id: ticket._id, data: { description: newDescription } },
      {
        onSuccess: () => {
          setIsEditingDescription(false)
          toast.success("Description updated successfully")
        },
      }
    )
  }

  const handleStatusChange = () => {
    if (!newStatus) return

    changeStatusMutation.mutate(
      { ticketId: ticket._id, status: newStatus },
      {
        onSuccess: () => {
          setNewStatus("")
        },
      }
    )
  }

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    submitFeedbackMutation.mutate(
      { ticketId: ticket._id, rating, feedbackComment },
      {
        onSuccess: () => {
          setShowFeedback(false)
          setRating(0)
          setFeedbackComment("")
        },
      }
    )
  }

  const handleRequestRefund = () => {
    requestRefundMutation.mutate(ticket._id)
  }

  const handleConfirmResolution = () => {
    confirmResolutionMutation.mutate(ticket._id)
  }

  const handleMarkNotResolved = () => {
    markNotResolvedMutation.mutate(ticket._id)
  }

  const handleDeleteTicket = () => {
    deleteTicketMutation.mutate(ticket._id, {
      onSuccess: () => {
        navigate("/dashboard/tickets")
      }
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/tickets")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Ticket Details</h1>
            <p className="text-sm text-muted-foreground font-mono">
              #{ticket._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("text-lg px-4 py-2 font-medium", statusColors[ticket.status])}
        >
          {ticket.status}
        </Badge>
        {(isManager || (isCustomer && ["Pending", "Assigned"].includes(ticket.status) && (Date.now() - new Date(ticket.createdAt).getTime() < 10 * 60 * 1000))) && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteTicketMutation.isPending}
            className="ml-4"
          >
            {deleteTicketMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Ticket
          </Button>
        )}
      </div>

      {/* Queue Position (if available) */}
      {queueData && queueData.queuePosition > 0 && ticket.status === "Pending" && (
        <Card className="bg-chart-2/10 border-chart-2/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-chart-2" />
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  Queue Position: <span className="text-lg font-bold text-chart-2">{queueData.queuePosition}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Your ticket is waiting to be assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Issue Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Issue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                  {ticket.category}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Description:</span>
                  {canUpdate && !isEditingDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateDescription}
                        disabled={updateTicketMutation.isPending}
                      >
                        {updateTicketMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingDescription(false)
                          setNewDescription(ticket.description || "")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-card-foreground bg-secondary/50 p-4 rounded-md">
                    {ticket.description || "No description provided"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Change (Technician/Supervisor/Manager) */}
          {canChangeStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Change Status
                </CardTitle>
                <CardDescription>Update the current status of this ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                    <SelectTrigger className="bg-input border-border text-card-foreground flex-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusChange}
                    disabled={!newStatus || changeStatusMutation.isPending}
                    className="bg-primary text-primary-foreground"
                  >
                    {changeStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm Resolution (Customer) */}
          {isCustomer && ticket.status === "Resolved" && (
            <Card className="bg-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-success" />
                  Confirm Resolution
                </CardTitle>
                <CardDescription>
                  Your ticket has been marked as resolved. Please confirm if the issue is fixed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-success">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>
                    Once you confirm, this ticket will be closed and no further updates can be made.
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmResolution}
                    disabled={confirmResolutionMutation.isPending}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    {confirmResolutionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4 mr-2" />
                    )}
                    Confirm & Close
                  </Button>
                  <Button
                    onClick={handleMarkNotResolved}
                    disabled={markNotResolvedMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {markNotResolvedMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Not Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Feedback (Customer) */}
          {canSubmitFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Submit Feedback
                </CardTitle>
                <CardDescription>
                  Rate your experience with this ticket resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showFeedback ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-sm">Rating</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={cn(
                                "w-8 h-8 cursor-pointer transition-colors",
                                star <= rating
                                  ? "fill-warning text-warning"
                                  : "text-muted-foreground hover:text-warning/50"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="text-sm">
                        Comments (Optional)
                      </Label>
                      <Textarea
                        id="feedback"
                        placeholder="Share your experience..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="bg-input border-border text-card-foreground min-h-20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowFeedback(false)
                          setRating(0)
                          setFeedbackComment("")
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={rating === 0 || submitFeedbackMutation.isPending}
                        className="flex-1 bg-primary text-primary-foreground"
                      >
                        {submitFeedbackMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Submit Feedback
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => setShowFeedback(true)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Provide Feedback
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Existing Feedback */}
          {ticket.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Customer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-6 h-6",
                        star <= ticket.rating!
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                {ticket.feedbackComment && (
                  <p className="text-sm text-card-foreground bg-secondary/50 p-4 rounded-md">
                    {ticket.feedbackComment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-card-foreground font-medium">
                  {createdDate.toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {createdDate.toLocaleTimeString()}
                </span>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="text-card-foreground font-medium">
                  {updatedDate.toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {updatedDate.toLocaleTimeString()}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days Open:</span>
                <Badge variant="outline" className={daysOpen > 7 ? "text-warning border-warning" : ""}>
                  {daysOpen} {daysOpen === 1 ? "day" : "days"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ticket.customer && (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="text-card-foreground font-medium">
                      {ticket.customer.fullName}
                    </span>
                    {ticket.customer.phoneNumber && (
                      <span className="text-xs text-muted-foreground">
                        {ticket.customer.phoneNumber}
                      </span>
                    )}
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Assigned To:</span>
                {(() => {
                  // Handle both technician (populated object) and assignedTo (populated object or string)
                  const technician = ticket.technician ||
                    (typeof ticket.assignedTo === 'object' && ticket.assignedTo ? ticket.assignedTo : null);

                  if (technician && typeof technician === 'object') {
                    return (
                      <>
                        <span className="text-card-foreground font-medium">
                          {technician.fullName}
                        </span>
                        {technician.phoneNumber && (
                          <span className="text-xs text-muted-foreground">
                            {technician.phoneNumber}
                          </span>
                        )}
                      </>
                    );
                  }
                  return <span className="text-warning">Not assigned yet</span>;
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Office */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Office
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ticket.office ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Branch:</span>
                    <span className="text-card-foreground font-medium">
                      {ticket.office.branchName}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-card-foreground">
                      {ticket.office.location}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">No office information</span>
              )}
            </CardContent>
          </Card>

          {/* Refund Status */}
          {isCustomer && (
            <Card className={refundData?.refundEligible && !ticket.refundRequested ? "bg-success/5 border-success/30" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Refund Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ticket.refundRequested ? (
                  <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30 w-full justify-center">
                    Refund Requested
                  </Badge>
                ) : refundData?.refundEligible ? (
                  <>
                    <div className="flex items-start gap-2 text-sm text-success">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <span>This ticket is eligible for a refund</span>
                    </div>
                    <Button
                      onClick={handleRequestRefund}
                      disabled={requestRefundMutation.isPending}
                      className="w-full bg-success text-success-foreground hover:bg-success/90"
                    >
                      {requestRefundMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4 mr-2" />
                      )}
                      Request Refund
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <span>
                        {ticket.status === "Pending" || ticket.status === "Assigned"
                          ? "Refund will be available if the ticket remains unresolved for an extended period"
                          : "This ticket is not eligible for a refund"}
                      </span>
                    </div>
                    <Button
                      disabled
                      className="w-full"
                      variant="outline"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Request Refund
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Refunds become available for tickets open longer than 7 days
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTicket}
        isLoading={deleteTicketMutation.isPending}
        title="Delete Support Ticket"
        description="Are you sure you want to delete this support ticket? This action cannot be undone and will permanently remove the ticket from your history."
      />
    </div>
  )
}


