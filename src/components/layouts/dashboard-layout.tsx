import type { ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Wifi,
  LayoutDashboard,
  Ticket,
  AlertTriangle,
  DollarSign,
  Users,
  BarChart3,
  Wrench,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

const navItemsByRole: Record<string, NavItem[]> = {
  customer: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Tickets", href: "/dashboard/tickets", icon: <Ticket className="w-5 h-5" /> },
    { label: "My Refunds", href: "/dashboard/my-refunds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Outages", href: "/dashboard/outages", icon: <AlertTriangle className="w-5 h-5" /> },
  ],
  supervisor: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Tickets", href: "/dashboard/tickets", icon: <Ticket className="w-5 h-5" /> },
    { label: "Outages", href: "/dashboard/outages", icon: <AlertTriangle className="w-5 h-5" /> },
    { label: "Technicians", href: "/dashboard/technicians", icon: <Users className="w-5 h-5" /> },
  ],
  technician: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Assigned Tasks", href: "/dashboard/tasks", icon: <Wrench className="w-5 h-5" /> },
  ],
  manager: [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "All Tickets", href: "/dashboard/tickets", icon: <Ticket className="w-5 h-5" /> },
    { label: "Refunds", href: "/dashboard/refunds", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ],
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const navItems = navItemsByRole[user.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <Wifi className="w-6 h-6 text-primary" />
          <span className="font-semibold text-sidebar-foreground">WMMS</span>
        </div>
        <UserMenu user={user} logout={handleLogout} />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <Wifi className="w-6 h-6 text-primary" />
                <span className="font-semibold text-sidebar-foreground">WMMS</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout()
                  setSidebarOpen(false)
                }}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <Wifi className="w-7 h-7 text-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">WMMS</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <UserMenu user={user} logout={handleLogout} expanded />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

function UserMenu({ user, logout, expanded = false }: { user: any; logout: () => void; expanded?: boolean }) {
  const initials = user.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("gap-3", expanded ? "w-full justify-start px-2" : "")}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

