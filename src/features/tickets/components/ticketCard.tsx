/**
 * Ticket Card Component
 * Displays a ticket in card format with status, details, and actions
 */

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User } from "lucide-react"
import type { Ticket } from "../types"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  Pending: "bg-warning/20 text-warning border-warning/30",
  Assigned: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  "In Progress": "bg-primary/20 text-primary border-primary/30",
  Resolved: "bg-success/20 text-success border-success/30",
  Closed: "bg-muted text-muted-foreground border-border",
}

interface TicketCardProps {
  ticket: Ticket
  showQueue?: boolean
  showCustomer?: boolean
  queuePosition?: number
  onAction?: (action: string, ticketId: string) => void
  actions?: Array<{ 
    label: string
    action: string
    variant?: "default" | "outline" | "destructive"
    disabled?: boolean
  }>
}

export function TicketCard({ 
  ticket, 
  showQueue, 
  showCustomer, 
  queuePosition,
  onAction, 
  actions 
}: TicketCardProps) {
  const navigate = useNavigate()
  const createdDate = new Date(ticket.createdAt)
  const daysOpen = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card 
      className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/dashboard/tickets/${ticket._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("font-medium", statusColors[ticket.status])}>
                {ticket.status}
              </Badge>
              <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border">
                {ticket.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              #{ticket._id.slice(-8).toUpperCase()}
            </p>
          </div>
          {showQueue && queuePosition && ["Pending", "Assigned"].includes(ticket.status) && (
            <div className="text-center px-3 py-1.5 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{queuePosition}</p>
              <p className="text-xs text-muted-foreground">in queue</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {ticket.description && (
          <p className="text-sm text-card-foreground line-clamp-2">{ticket.description}</p>
        )}
        
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {daysOpen === 0 ? "Today" : `${daysOpen} days ago`}
          </span>
          
          {ticket.office && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {ticket.office.branchName}
            </span>
          )}
          
          {showCustomer && ticket.customer && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {ticket.customer.fullName}
            </span>
          )}
          
          {ticket.technician && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Tech: {ticket.technician.fullName}
            </span>
          )}
        </div>

        {ticket.refundRequested && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            Refund Requested
          </Badge>
        )}
      </CardContent>

      {actions && actions.length > 0 && onAction && (
        <CardFooter className="pt-0 gap-2 flex-wrap">
          {actions.map((a) => (
            <Button
              key={a.action}
              size="sm"
              variant={a.variant || "default"}
              onClick={(e) => {
                e.stopPropagation()
                onAction(a.action, ticket._id)
              }}
              disabled={a.disabled}
              className={a.variant === "default" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            >
              {a.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  )
}

