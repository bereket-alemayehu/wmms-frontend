/**
 * Create Ticket Dialog Component
 * Modal dialog for creating new support tickets
 */

import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { TicketCategory, CreateTicketRequest } from "../types"
import { useCreateTicket } from "../hooks"

interface CreateTicketDialogProps {
  offices?: Array<{ _id: string; branchName: string; location: string }>
  defaultOfficeId?: string
}

export function CreateTicketDialog({ offices = [], defaultOfficeId }: CreateTicketDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<TicketCategory | "">("")
  const [description, setDescription] = useState("")
  const [officeId, setOfficeId] = useState(defaultOfficeId || user?.officeId || offices[0]?._id || "")

  const createTicketMutation = useCreateTicket()

  const handleSubmit = async () => {
    if (!category || !officeId) return

    const ticketData: CreateTicketRequest = {
      category,
      description,
      officeId,
    }

    createTicketMutation.mutate(ticketData, {
      onSuccess: () => {
        setOpen(false)
        setCategory("")
        setDescription("")
      },
    })
  }

  const isLoading = createTicketMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Create Support Ticket</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Describe your Wi-Fi issue and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-card-foreground">
              Issue Category
            </Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
              <SelectTrigger id="category" className="bg-input border-border text-card-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Connection">No Connection</SelectItem>
                <SelectItem value="Speed Issue">Speed Issue</SelectItem>
                <SelectItem value="Hardware Fault">Hardware Fault</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {offices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="office" className="text-card-foreground">
                Branch Office
              </Label>
              <Select value={officeId} onValueChange={setOfficeId}>
                <SelectTrigger id="office" className="bg-input border-border text-card-foreground">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office._id} value={office._id}>
                      {office.branchName} - {office.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground min-h-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-border text-card-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!category || !officeId || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Submit Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

