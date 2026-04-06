import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import HealthTips from "@/components/HealthTips";
import { Button } from "@/components/ui/button";
import { Search, Activity } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      {/* Hero */}
      <section className="mb-8 animate-slide-up">
        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Hello, {user?.name} 👋
          </h1>
          <p className="mt-2 max-w-lg text-primary-foreground/80">
            Get AI-powered disease predictions based on your symptoms with explainable insights into each diagnosis.
          </p>
          <Button
            onClick={() => navigate("/search")}
            className="mt-5 bg-card text-card-foreground hover:bg-card/90 font-semibold"
          >
            <Search className="mr-2 h-4 w-4" />
            Start Prediction
          </Button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in">
        {[
          { label: "Predictions Made", value: JSON.parse(localStorage.getItem("health_history") || "[]").length, icon: Activity },
          { label: "Diseases Covered", value: "20+", icon: Search },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <s.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </section>

      <HealthTips />
    </AppLayout>
  );
};

export default Index;
