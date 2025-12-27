import { useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, X } from "lucide-react"
import { mockUsers, mockTickets } from "@/lib/mock-data"
import type { Outage } from "@/lib/types"

// Available zones/areas based on office locations
const AVAILABLE_ZONES = [
  "Bole",
  "Gerji",
  "CMC",
  "Kazanchis",
  "Piassa",
  "Arada",
  "Megenagna",
  "Bole Road",
  "Airport Road",
  "CMC Area",
]

interface PostOutageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    message: string
    affectedAreas: string[]
    estimatedResolution?: string
  }) => Promise<void>
  officeId: string
}

export function PostOutageDialog({ open, onOpenChange, onSubmit, officeId }: PostOutageDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [estimatedResolution, setEstimatedResolution] = useState("")

  // Calculate affected customers based on selected zones and office
  const affectedCustomersCount = useMemo(() => {
    if (selectedZones.length === 0) return 0

    // Get tickets for customers in the selected office
    // In a real system, you'd match customers to zones based on their service location
    // For now, we'll estimate based on tickets in the office
    const officeTickets = mockTickets.filter((t) => t.officeId === officeId)
    const uniqueCustomers = new Set(officeTickets.map((t) => t.customerId))

    // Estimate: assume a percentage of customers in the office are in the selected zones
    // More zones = more customers affected (but with diminishing returns)
    // This is a simplified calculation - in production, you'd have customer zone mapping
    const baseCount = uniqueCustomers.size
    const zoneMultiplier = Math.min(selectedZones.length * 0.3, 0.9) // Cap at 90% max
    return Math.max(1, Math.round(baseCount * zoneMultiplier))
  }, [selectedZones, officeId])

  const handleZoneToggle = (zone: string) => {
    setSelectedZones((prev) => (prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]))
  }

  const handleSubmit = async () => {
    if (!title || !message || selectedZones.length === 0) return

    setLoading(true)
    await onSubmit({
      title,
      message,
      affectedAreas: selectedZones,
      estimatedResolution: estimatedResolution || undefined,
    })
    setLoading(false)
    onOpenChange(false)
    // Reset form
    setTitle("")
    setMessage("")
    setSelectedZones([])
    setEstimatedResolution("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Post Outage Alert</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Broadcast a service outage notification to affected customers
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground">
              Outage Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Fiber Cut in Bole Area"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border text-card-foreground"
            />
          </div>

          {/* Zone Selector */}
          <div className="space-y-2">
            <Label className="text-card-foreground">Affected Zones *</Label>
            <div className="flex flex-wrap gap-2 p-3 bg-secondary rounded-lg border border-border min-h-[80px]">
              {selectedZones.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select zones below...</p>
              ) : (
                selectedZones.map((zone) => (
                  <Badge
                    key={zone}
                    variant="secondary"
                    className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                    onClick={() => handleZoneToggle(zone)}
                  >
                    {zone}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ZONES.filter((z) => !selectedZones.includes(z)).map((zone) => (
                <Badge
                  key={zone}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary border-border"
                  onClick={() => handleZoneToggle(zone)}
                >
                  {zone}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message Composer */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-card-foreground">
              Alert Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Describe the outage, expected impact, and resolution timeline..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground min-h-32"
            />
          </div>

          {/* Estimated Resolution */}
          <div className="space-y-2">
            <Label htmlFor="estimatedResolution" className="text-card-foreground">
              Estimated Resolution (Optional)
            </Label>
            <Input
              id="estimatedResolution"
              type="datetime-local"
              value={estimatedResolution}
              onChange={(e) => setEstimatedResolution(e.target.value)}
              className="bg-input border-border text-card-foreground"
            />
          </div>

          {/* Impact Preview */}
          <div className="p-4 bg-secondary rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Label className="text-card-foreground font-medium">Impact Preview</Label>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Estimated affected customers: <span className="font-semibold text-secondary-foreground">{affectedCustomersCount}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Based on {selectedZones.length} selected zone{selectedZones.length !== 1 ? "s" : ""} in your office area
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-card-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !message || selectedZones.length === 0 || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Broadcast Outage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

