import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import CreateTicketPage from "@/pages/CreateTicketPage";
import CreateUserPage from "@/pages/CreateUserPage";
import TicketDetailPage from "@/pages/TicketDetailPage";
import DashboardLayout from "@/components/dashboard-layout";
import {
  LandingRedirect,
  RequirePermission,
} from "@/components/require-permission";
import { PERMISSIONS } from "@/features/auth/permissions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
                <Dashboard />
              </RequirePermission>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/my-tickets"
            element={
              <RequirePermission permission={PERMISSIONS.TICKET_VIEW}>
                <MyTicketsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <RequirePermission permission={PERMISSIONS.TICKET_VIEW}>
                <TicketDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <RequirePermission permission={PERMISSIONS.TICKET_CREATE}>
                <CreateTicketPage />
              </RequirePermission>
            }
          />
          <Route
            path="/create-user"
            element={
              <RequirePermission permission={PERMISSIONS.USER_CREATE}>
                <CreateUserPage />
              </RequirePermission>
            }
          />
        </Route>
        <Route path="/" element={<LandingRedirect />} />
        <Route path="*" element={<LandingRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
