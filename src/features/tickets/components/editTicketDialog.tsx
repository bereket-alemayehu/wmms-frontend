/**
 * Edit Ticket Dialog Component
 * Modal dialog for updating existing support tickets
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import type { Ticket, TicketCategory } from "../types"
import { useUpdateTicket } from "../hooks"

interface EditTicketDialogProps {
    ticket: Ticket | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTicketDialog({ ticket, open, onOpenChange }: EditTicketDialogProps) {
    const [category, setCategory] = useState<TicketCategory | "">("")
    const [description, setDescription] = useState("")

    const updateTicketMutation = useUpdateTicket()

    // Reset form when ticket changes or dialog opens
    useEffect(() => {
        if (ticket && open) {
            setCategory(ticket.category as TicketCategory)
            setDescription(ticket.description || "")
        }
    }, [ticket, open])

    const handleSubmit = () => {
        if (!ticket || !category) return

        updateTicketMutation.mutate(
            {
                id: ticket._id,
                data: { category, description }
            },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    const isLoading = updateTicketMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">Edit Support Ticket</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update the details of your service request.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-category" className="text-card-foreground">
                            Issue Category
                        </Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                            <SelectTrigger id="edit-category" className="bg-input border-border text-card-foreground">
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

                    <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-card-foreground">
                            Description
                        </Label>
                        <Textarea
                            id="edit-description"
                            placeholder="Describe your issue in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground min-h-24"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-card-foreground">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!category || isLoading || (category === ticket?.category && description === ticket?.description)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
