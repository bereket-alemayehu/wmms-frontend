import { useMemo, useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { OutageCard } from "@/features/outages/components/outage-card"
import { PostOutageDialog } from "@/features/outages/components/post-outage-dialog"
import { useOutages, useCreateOutage, useUpdateOutage, useDeleteOutage } from "@/features/outages/hooks"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, WifiOff, Plus, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function OutagesPage() {
  const { user } = useAuth()
  const { data: outages = [], isLoading, error } = useOutages()
  const createOutageMutation = useCreateOutage()
  const updateOutageMutation = useUpdateOutage()
  const deleteOutageMutation = useDeleteOutage()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [outageToDelete, setOutageToDelete] = useState<string | null>(null)

  // Role-based filtering
  const filteredOutages = useMemo(() => {
    if (!user || !outages) return []
    
    // Customers see all outages
    if (user.role === "customer") return outages
    
    // Technicians and Supervisors see only their office outages
    if (user.role === "technician" || user.role === "supervisor") {
      return outages.filter((o) => {
        if (!o.officeId) return false
        const officeId = typeof o.officeId === 'object' && o.officeId !== null 
          ? o.officeId._id 
          : o.officeId
        return officeId === user.officeId
      })
    }
    
    // Managers see all outages
    return outages
  }, [user, outages])

  // Role-based permissions
  const canCreate = user?.role === "supervisor" || user?.role === "manager"
  const canUpdate = user?.role === "supervisor" || user?.role === "manager"
  const canDelete = user?.role === "manager"

  if (!user) return null

  const active = filteredOutages.filter((o) => o.status === "Active")
  const resolved = filteredOutages.filter((o) => o.status !== "Active")

  const handleCreateOutage = async (data: {
    title: string
    message: string
    affectedAreas: string[]
    estimatedResolution?: string
  }) => {
    if (!user?.officeId) {
      toast.error("You must be assigned to an office to create outages")
      return
    }

    // officeId is automatically set by backend from authenticated user
    await createOutageMutation.mutateAsync(data)
  }

  const handleUpdateOutage = async (id: string, data: { status?: 'Active' | 'Resolved' }) => {
    await updateOutageMutation.mutateAsync({ id, data })
  }

  const handleDeleteOutage = (id: string) => {
    setOutageToDelete(id)
  }

  const confirmDeleteOutage = async () => {
    if (!outageToDelete) return
    await deleteOutageMutation.mutateAsync(outageToDelete)
    setOutageToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load outages</p>
          <p className="text-sm text-muted-foreground mt-2">{String(error)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outages</h1>
          <p className="text-muted-foreground">Service disruptions and maintenance notices</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            {active.length} active / {filteredOutages.length} total
          </div>
          {canCreate && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Outage
            </Button>
          )}
        </div>
      </div>

      {canCreate && (
        <PostOutageDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateOutage}
          officeId={user.officeId!}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={outageToDelete !== null} onOpenChange={(open) => !open && setOutageToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Outage
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this outage? This action cannot be undone and will permanently remove the outage notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setOutageToDelete(null)}
              className="border-border text-card-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOutage}
              disabled={deleteOutageMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOutageMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Active</h2>
          {active.length === 0 && <WifiOff className="w-4 h-4 text-muted-foreground" />}
        </div>
        {active.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
            No active outages.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((outage) => (
              <OutageCard 
                key={outage._id} 
                outage={outage}
                onUpdate={canUpdate ? handleUpdateOutage : undefined}
                onDelete={canDelete ? handleDeleteOutage : undefined}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Resolved / Scheduled</h2>
        {resolved.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-6 bg-card">
            No resolved or scheduled outages.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resolved.map((outage) => (
              <OutageCard 
                key={outage._id} 
                outage={outage}
                onUpdate={canUpdate ? handleUpdateOutage : undefined}
                onDelete={canDelete ? handleDeleteOutage : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
