// src/__tests__/routing.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';

// --- Helpers: minimal route guard replicas ---

function ProtectedRoute({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { role: string } | null;
}) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({
  children,
  user,
  allowedRoles,
}: {
  children: React.ReactNode;
  user: { role: string } | null;
  allowedRoles: string[];
}) {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// --- Tests ---

describe('Protected Routes', () => {
  test('redirects unauthenticated user to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={null}>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  test('allows authenticated user to access /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={{ role: 'customer' }}>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});

describe('Role-Based Routes', () => {
  test('redirects non-manager away from manager-only page', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/refunds']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Fallback</div>} />
          <Route
            path="/dashboard/refunds"
            element={
              <RoleRoute
                user={{ role: 'customer' }}
                allowedRoles={['manager']}
              >
                <div>Refunds Page</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Refunds Page')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Fallback')).toBeInTheDocument();
  });

  test('allows manager to access manager-only page', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/refunds']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Fallback</div>} />
          <Route
            path="/dashboard/refunds"
            element={
              <RoleRoute
                user={{ role: 'manager' }}
                allowedRoles={['manager']}
              >
                <div>Refunds Page</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Refunds Page')).toBeInTheDocument();
  });

  test('redirects unauthenticated user from role-protected route to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/supervisors']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Fallback</div>} />
          <Route
            path="/dashboard/supervisors"
            element={
              <RoleRoute user={null} allowedRoles={['manager']}>
                <div>Supervisors Page</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
