import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calculator, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  suggestions: string[];
}

function calculateBMI(heightCm: number, weightKg: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  if (rounded < 18.5) return {
    bmi: rounded, category: "Underweight", color: "text-accent",
    suggestions: [
      "Eat nutrient-dense foods including nuts, avocados, and whole grains",
      "Add healthy calorie-rich snacks between meals",
      "Include protein-rich foods like eggs, lentils, and dairy",
      "Consult a nutritionist for a personalized weight gain plan",
      "Avoid skipping meals — eat at regular intervals",
    ],
  };
  if (rounded < 25) return {
    bmi: rounded, category: "Normal Weight", color: "text-primary",
    suggestions: [
      "Great job! Maintain your current balanced diet and exercise routine",
      "Continue with 30 minutes of moderate exercise most days",
      "Stay hydrated and get 7-9 hours of quality sleep",
      "Schedule annual health checkups to monitor your status",
      "Focus on whole foods and limit processed food intake",
    ],
  };
  if (rounded < 30) return {
    bmi: rounded, category: "Overweight", color: "text-warning",
    suggestions: [
      "Reduce portion sizes and eat more vegetables and fruits",
      "Aim for 150+ minutes of moderate exercise per week",
      "Limit sugary drinks, fried foods, and refined carbs",
      "Track your meals to become aware of eating patterns",
      "Consider consulting a dietitian for a structured plan",
    ],
  };
  return {
    bmi: rounded, category: "Obese", color: "text-destructive",
    suggestions: [
      "Consult a healthcare professional for a comprehensive health plan",
      "Start with low-impact exercises like walking or swimming",
      "Adopt a sustainable calorie-controlled diet — avoid crash diets",
      "Monitor blood pressure, blood sugar, and cholesterol regularly",
      "Seek support from a nutritionist or weight management program",
    ],
  };
}

const BMICalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const handleCalculate = () => {
    setError("");
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!h || h < 50 || h > 300) { setError("Enter a valid height (50–300 cm)"); return; }
    if (!w || w < 10 || w > 500) { setError("Enter a valid weight (10–500 kg)"); return; }
    if (!a || a < 2 || a > 120) { setError("Enter a valid age (2–120)"); return; }
    setResult(calculateBMI(h, w));
  };

  const handleReset = () => {
    setHeight(""); setWeight(""); setAge(""); setResult(null); setError("");
  };

  const bmiBarValue = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Calculator className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">BMI & Health Status</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Check your Body Mass Index and get health advice</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Height (cm)</label>
              <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Weight (kg)</label>
              <Input type="number" placeholder="65" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Age</label>
              <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={handleCalculate} className="flex-1">Calculate BMI</Button>
            <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
          </div>
        </section>

        {/* Result */}
        {result && (
          <>
            <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                <p className={`text-5xl font-display font-bold ${result.color}`}>{result.bmi}</p>
                <p className={`text-lg font-semibold mt-1 ${result.color}`}>{result.category}</p>
              </div>
              <Progress value={bmiBarValue} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-8">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                {result.category === "Normal Weight" ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                Health Suggestions
              </h2>
              <ul className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <div className="text-center mb-8">
          <Button onClick={() => navigate("/")} className="px-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default BMICalculator;
