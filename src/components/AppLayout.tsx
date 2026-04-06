import { NavLink, useNavigate } from "react-router-dom";
import { Home, Search, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "../asset/image/logo.webp"

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              {/* <span className="text-lg font-bold text-primary-foreground">H</span> */}
              <img src={logo} alt="logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">HealthPredict</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>
              <Home className="h-4 w-4" /> Home
            </NavLink>
            <NavLink to="/search" className={linkClass}>
              <Search className="h-4 w-4" /> Predict
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              <Clock className="h-4 w-4" /> History
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">Hi, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex justify-around py-2">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            <Home className="h-5 w-5" /> Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            <Search className="h-5 w-5" /> Predict
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            <Clock className="h-5 w-5" /> History
          </NavLink>
        </div>
      </nav>

      <main className="container pb-24 pt-6 md:pb-6">{children}</main>
    </div>
  );
};

export default AppLayout;
