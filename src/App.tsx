import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/common/theme-provider";
import { AuthProvider } from "@/features/auth/contexts/auth-context";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { TicketsPage } from "@/pages/TicketsPage";
import { OutagesPage } from "@/pages/OutagesPage";
import { TasksPage } from "@/pages/TasksPage";
import { TechniciansPage } from "@/pages/TechniciansPage";
import { RefundsPage } from "@/pages/RefundsPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { MyRefundsPage } from "@/pages/MyRefundsPage";
import { OfficesPage } from "@/pages/OfficesPage";
import { useAuth } from "@/features/auth/hooks/useAuth";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tickets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/outages"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OutagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tasks"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TasksPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/technicians"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TechniciansPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/offices"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <OfficesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/refunds"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RefundsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnalyticsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-refunds"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MyRefundsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
