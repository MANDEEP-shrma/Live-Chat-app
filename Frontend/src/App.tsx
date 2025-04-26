import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfileEdit from "./pages/ProfileEdit";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
//Sonner is use to give notification to the user for profile update or invalid credentials type.
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.body.style.pointerEvents = "auto";
    return () => {
      // Reset when component unmounts
      document.body.style.pointerEvents = "";
    };
  }, []);
  return (
    <ThemeProvider defaultTheme="light" storageKey="chat-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;
