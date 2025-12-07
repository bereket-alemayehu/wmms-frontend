import { useAuth } from '@/features/auth/hooks/useAuth'
import { CustomerDashboard } from '@/features/dashboard/components/customer-dashboard'
import { SupervisorDashboard } from '@/features/dashboard/components/supervisor-dashboard'
import { TechnicianDashboard } from '@/features/dashboard/components/technician-dashboard'
import { ManagerDashboard } from '@/features/dashboard/components/manager-dashboard'

export function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const dashboardByRole: Record<string, JSX.Element> = {
    customer: <CustomerDashboard />,
    supervisor: <SupervisorDashboard />,
    technician: <TechnicianDashboard />,
    manager: <ManagerDashboard />,
  }

  return dashboardByRole[user.role] || <CustomerDashboard />
}

