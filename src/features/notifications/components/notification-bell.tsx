import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount, useNotifications } from "../hooks/useNotifications";
import { NotificationList } from "./notification-list";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data: unreadCount = 0, error: countError } = useUnreadCount();
  const { data: notifications = [], error: notificationsError } = useNotifications({ limit: 10 });

  // Log errors for debugging
  useEffect(() => {
    if (countError) {
      console.error("Notification count error:", countError);
    }
    if (notificationsError) {
      console.error("Notifications error:", notificationsError);
    }
    // Log successful data
    if (unreadCount !== undefined && unreadCount !== null) {
      console.log("Unread count:", unreadCount);
    }
    if (notifications && notifications.length > 0) {
      console.log("Notifications:", notifications);
    }
  }, [countError, notificationsError, unreadCount, notifications]);

  const count = typeof unreadCount === "number" ? unreadCount : 0;
  const notificationList = Array.isArray(notifications) ? notifications : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                count > 9 && "px-1 w-auto min-w-[20px]"
              )}
            >
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationList notifications={notificationList} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

