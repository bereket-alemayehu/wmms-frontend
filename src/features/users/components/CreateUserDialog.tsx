/**
 * Create User Dialog Component
 * Modal dialog for creating new staff credentials
 */

import { useState } from "react"
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
import { Loader2, UserPlus, AlertCircle } from "lucide-react"
import { useCreateUser } from "../hooks/useCreateUser"
import { useOffices } from "@/features/offices/hooks/useOffices"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CreateUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: "technician" | "supervisor"
    officeId?: string // Optional, used for managers to pre-select office
}

export function CreateUserDialog({ open, onOpenChange, role, officeId }: CreateUserDialogProps) {
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [serviceNumber, setServiceNumber] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [selectedOfficeId, setSelectedOfficeId] = useState(officeId || "")

    const { data: offices = [] } = useOffices()
    const createUserMutation = useCreateUser()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== passwordConfirm) {
            toast.error("Passwords do not match")
            return
        }

        const userData = {
            fullName,
            phoneNumber,
            serviceNumber,
            password,
            passwordConfirm,
            role,
            officeId: selectedOfficeId || undefined
        }

        createUserMutation.mutate(userData, {
            onSuccess: () => {
                onOpenChange(false)
                resetForm()
            },
        })
    }

    const resetForm = () => {
        setFullName("")
        setPhoneNumber("")
        setServiceNumber("")
        setPassword("")
        setPasswordConfirm("")
        setSelectedOfficeId(officeId || "")
    }

    const isLoading = createUserMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Create New {role === "technician" ? "Technician" : "Supervisor"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Provide the credentials for the new {role}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            placeholder="+251..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="serviceNumber">Service Number (Username)</Label>
                        <Input
                            id="serviceNumber"
                            placeholder="e.g. SN-001"
                            value={serviceNumber}
                            onChange={(e) => setServiceNumber(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Initial Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirm">Confirm Password</Label>
                        <Input
                            id="passwordConfirm"
                            type="password"
                            placeholder="••••••••"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* Office selection only for managers. Supervisors inherit their office. */}
                    {!officeId && (
                        <div className="space-y-2">
                            <Label htmlFor="officeId">Office</Label>
                            <Select value={selectedOfficeId} onValueChange={setSelectedOfficeId} required>
                                <SelectTrigger id="officeId">
                                    <SelectValue placeholder="Select Office" />
                                </SelectTrigger>
                                <SelectContent>
                                    {offices.map((office) => (
                                        <SelectItem key={office._id} value={office._id}>
                                            {office.branchName} ({office.cityName})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {createUserMutation.isError && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md animate-in fade-in zoom-in duration-200">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{(createUserMutation.error as any)?.message || "Failed to create user account"}</p>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border text-card-foreground"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            Create Account
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
