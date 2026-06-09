import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { DashboardPage } from '@/pages/Dashboard';
import { PortfolioListPage } from '@/pages/PortfolioList';
import { PortfolioCreatePage } from '@/pages/PortfolioCreate';
import { PortfolioEditPage } from '@/pages/PortfolioEdit';

function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/portfolios"
              element={
                <Layout>
                  <PortfolioListPage />
                </Layout>
              }
            />
            <Route
              path="/portfolios/new"
              element={
                <Layout>
                  <PortfolioCreatePage />
                </Layout>
              }
            />
            <Route
              path="/portfolios/:id/edit"
              element={
                <Layout>
                  <PortfolioEditPage />
                </Layout>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
