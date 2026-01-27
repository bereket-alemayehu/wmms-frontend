import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Phone, MapPin, Search, Loader2, UserPlus } from "lucide-react";
import { useOffices } from "@/features/offices/hooks/useOffices";
import { useSupervisorsByOffice } from "@/features/users/hooks/ getSupervisors";
import { CreateUserDialog } from "@/features/users/components/CreateUserDialog";

export function SupervisorsPage() {
    const { user } = useAuth();
    const { data: offices = [] } = useOffices();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Managers see all supervisors
    const { data: supervisors = [], isLoading: supervisorsLoading } = useSupervisorsByOffice();

    if (!user || user.role !== "manager") return null;

    const filteredSupervisors = useMemo(() => {
        let filtered = supervisors;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (sup) =>
                    sup.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sup.phoneNumber.includes(searchQuery),
            );
        }

        return filtered;
    }, [supervisors, searchQuery]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Supervisors</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor branch supervisors
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{filteredSupervisors.length} supervisor(s)</span>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Supervisor
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search supervisors by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Supervisors Grid */}
            {supervisorsLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredSupervisors.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-lg">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                        No supervisors found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchQuery
                            ? "Try adjusting your search query."
                            : "No supervisors have been created yet."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSupervisors.map((sup: any) => {
                        const supOfficeId = typeof sup.officeId === 'string' ? sup.officeId : sup.officeId?._id;
                        const office: any = offices.find((o: any) => o._id === supOfficeId);

                        return (
                            <Card
                                key={sup._id}
                                className="bg-card border-border hover:border-primary/30 transition-colors"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                                                    {getInitials(sup.fullName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg text-card-foreground truncate">
                                                    {sup.fullName}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {sup.phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Office Location */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {office?.branchName ||
                                                (typeof sup.officeId === 'object' && sup.officeId?.branchName) ||
                                                office?.cityName ||
                                                "Unknown office"}
                                        </span>
                                    </div>

                                    {/* Contact Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full border-border text-card-foreground bg-transparent"
                                        onClick={() => window.open(`tel:${sup.phoneNumber}`)}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Supervisor
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <CreateUserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                role="supervisor"
            />
        </div>
    );
}
