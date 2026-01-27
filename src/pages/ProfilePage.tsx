import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateProfile, useUpdatePassword } from "@/features/auth/hooks/useProfile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Lock, Mail, Phone, Hash, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ProfilePage() {
    const { user } = useAuth();
    const updateProfileMutation = useUpdateProfile();
    const updatePasswordMutation = useUpdatePassword();

    // Profile Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setEmail(user.email || "");
            setPhoneNumber(user.phoneNumber || "");
        }
    }, [user]);

    if (!user) return null;

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({
            fullName,
            email,
            phoneNumber,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePasswordMutation.mutate(
            {
                currentPassword,
                newPassword,
                newPasswordConfirm,
            },
            {
                onSuccess: () => {
                    // Clear password fields on success
                    setCurrentPassword("");
                    setNewPassword("");
                    setNewPasswordConfirm("");
                },
            }
        );
    };

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details. Service number and role are managed by the system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Read-Only Fields */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="serviceNumber" className="text-muted-foreground">Service Number</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="serviceNumber"
                                                value={user.serviceNumber}
                                                disabled
                                                className="pl-9 bg-muted text-muted-foreground"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-muted-foreground">Role</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="role"
                                                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                disabled
                                                className="pl-9 bg-muted text-muted-foreground"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Editable Fields */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phoneNumber"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="pl-9"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Ensure your account is using a long, random password to stay secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
                                    <Input
                                        id="newPasswordConfirm"
                                        type="password"
                                        value={newPasswordConfirm}
                                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button
                                type="submit"
                                form="password-form"
                                disabled={updatePasswordMutation.isPending}
                            >
                                {updatePasswordMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
