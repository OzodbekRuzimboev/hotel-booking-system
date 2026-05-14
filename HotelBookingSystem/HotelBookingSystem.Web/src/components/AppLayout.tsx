import { Outlet } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <div className="app-content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
