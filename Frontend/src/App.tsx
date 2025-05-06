import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import ProfileEdit from "./pages/ProfileEdit";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
//Sonner is use to give notification to the user for profile update or invalid credentials type.
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BlockedUser from "./pages/BlockedUsers";
import TermsAndConditions from "./pages/Termsandcondition";
import Support from "./pages/Support";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="chat-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Public-only routes (redirect to dashboard if logged in) */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        {/* Protected routes (redirect to login if not authenticated) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blocked-users"
          element={
            <ProtectedRoute>
              <BlockedUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <TermsAndConditions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
}

export default App;
