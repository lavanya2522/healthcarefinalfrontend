import { useNavigate } from "react-router-dom";
import { Droplets, Dumbbell, Apple, Calculator, Brain, HeartPulse } from "lucide-react";

const tips = [
  { icon: Droplets, title: "Stay Hydrated", desc: "Smart hydration reminders based on your schedule.", path: "/hydration" },
  { icon: Dumbbell, title: "Exercise Regularly", desc: "Personalized exercise & yoga recommendations.", path: "/exercise" },
  { icon: Apple, title: "Balanced Diet", desc: "Include fruits, vegetables, and whole grains in every meal.", path: "/tips/balanced-diet" },
  { icon: Calculator, title: "BMI & Health Status", desc: "Calculate your BMI and get health suggestions.", path: "/bmi" },
  { icon: Brain, title: "Mental Wellness", desc: "Meditation, breathing, and stress relief guide.", path: "/mental-wellness" },
  { icon: HeartPulse, title: "Medical Guidance", desc: "Schedule routine health screenings to catch issues early.", path: "/tips/regular-checkups" },
];

const HealthTips = () => {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in">
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Daily Health Tips</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <div
            key={tip.title}
            onClick={() => navigate(tip.path)}
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 active:scale-[0.98]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
              <tip.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-card-foreground">{tip.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tip.desc}</p>
            <span className="mt-3 inline-block text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Learn more →
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HealthTips;
