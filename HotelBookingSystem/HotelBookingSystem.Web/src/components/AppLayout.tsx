import { Outlet } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { Navbar } from "./Navbar";

export function AppLayout() {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
    </AuthProvider>
  );
}
