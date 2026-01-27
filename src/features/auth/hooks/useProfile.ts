import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/axios";
import { useAuth } from "../contexts/auth-context";

/**
 * Hook to update user profile information
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuth();

    return useMutation({
        mutationFn: async (data: {
            fullName: string;
            phoneNumber: string;
            email: string;
        }) => {
            const response = await apiClient.patch("/auth/me", data);
            return response.data;
        },
        onSuccess: (data) => {
            // Update auth context
            if (data.data?.user) {
                // Preserve role and other fields while updating allowed fields
                const updatedUser = {
                    ...user,
                    ...data.data.user
                };
                // We need to type cast here because user context expects a specific shape
                // and deep merging might be complex with types
                setUser(updatedUser as any);
            }

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

            toast.success("Profile updated successfully");
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || "Failed to update profile";
            toast.error(message);
        },
    });
};

/**
 * Hook to update user password
 */
export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (data: {
            currentPassword: string;
            newPassword: string;
            newPasswordConfirm: string;
        }) => {
            const response = await apiClient.patch("/auth/update-password", data);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || "Failed to update password";
            toast.error(message);
        },
    });
};
