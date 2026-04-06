import { useParams, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Droplets,
  Dumbbell,
  Apple,
  Moon,
  Brain,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Star,
  Clock,
  Shield,
} from "lucide-react";

const healthTipData: Record<
  string,
  {
    icon: any;
    title: string;
    tagline: string;
    description: string;
    benefits: string[];
    dailyTips: string[];
    precautions: string[];
    routine?: string[];
    motivation: string;
  }
> = {
  "stay-hydrated": {
    icon: Droplets,
    title: "Stay Hydrated",
    tagline: "Water is the foundation of life and wellness.",
    description:
      "Proper hydration is essential for nearly every bodily function. Water helps regulate body temperature, transport nutrients, flush out toxins, lubricate joints, and maintain organ function. Even mild dehydration can cause fatigue, headaches, poor concentration, and reduced physical performance. Most adults need about 2–3 liters of water per day, though this varies based on activity level, climate, and individual health.",
    benefits: [
      "Improves energy levels and brain function",
      "Aids digestion and prevents constipation",
      "Promotes healthy, glowing skin",
      "Supports kidney function and toxin removal",
      "Helps regulate body temperature during exercise",
      "Can assist with weight management by reducing appetite",
    ],
    dailyTips: [
      "Start your day with a glass of warm water and lemon",
      "Carry a reusable water bottle everywhere you go",
      "Set hourly reminders to drink water",
      "Eat water-rich foods like cucumbers, watermelon, and oranges",
      "Drink a glass of water before each meal",
      "Replace sugary drinks with herbal teas or infused water",
    ],
    precautions: [
      "Avoid excessive water intake (overhydration/hyponatremia)",
      "People with kidney issues should consult a doctor about fluid intake",
      "Don't rely on thirst alone — drink regularly throughout the day",
      "Avoid very cold water during meals as it may affect digestion",
    ],
    motivation:
      "Think of water as your body's fuel. Every cell, tissue, and organ depends on it. A well-hydrated body is a well-functioning body — start sipping!",
  },
  "exercise-regularly": {
    icon: Dumbbell,
    title: "Exercise Regularly",
    tagline: "Movement is medicine for the body and mind.",
    description:
      "Regular physical activity is one of the most impactful things you can do for your health. Exercise strengthens the heart, builds muscle, improves flexibility, boosts mood through endorphin release, and reduces the risk of chronic diseases including heart disease, diabetes, and certain cancers. The WHO recommends at least 150 minutes of moderate-intensity exercise per week for adults.",
    benefits: [
      "Reduces risk of heart disease and stroke by up to 35%",
      "Improves mental health and reduces anxiety and depression",
      "Strengthens bones and muscles, preventing osteoporosis",
      "Boosts immune system function",
      "Improves sleep quality and energy levels",
      "Helps maintain a healthy weight and metabolism",
    ],
    dailyTips: [
      "Start with 15-minute walks and gradually increase duration",
      "Try bodyweight exercises: squats, push-ups, planks",
      "Take the stairs instead of the elevator",
      "Stretch for 5–10 minutes every morning",
      "Join a fitness class or find a workout buddy for accountability",
      "Mix cardio (walking, cycling) with strength training",
    ],
    precautions: [
      "Always warm up before and cool down after exercise",
      "Stay hydrated during physical activity",
      "Don't push through sharp or persistent pain",
      "Consult a doctor before starting intense exercise if you have existing conditions",
      "Allow rest days for muscle recovery",
    ],
    routine: [
      "Monday: 30-min brisk walk + stretching",
      "Tuesday: Bodyweight exercises (push-ups, squats, lunges)",
      "Wednesday: Rest or gentle yoga",
      "Thursday: 30-min cycling or swimming",
      "Friday: Strength training with resistance bands",
      "Saturday: Outdoor activity (hiking, sports)",
      "Sunday: Rest and recovery",
    ],
    motivation:
      "You don't have to be extreme — just consistent. A 30-minute walk today is better than a perfect workout you never start. Your future self will thank you!",
  },
  "balanced-diet": {
    icon: Apple,
    title: "Balanced Diet",
    tagline: "Nourish your body with the right fuel.",
    description:
      "A balanced diet provides your body with the essential nutrients it needs to function correctly. This means eating a variety of foods from all food groups in the right proportions: fruits, vegetables, whole grains, lean proteins, and healthy fats. Good nutrition supports immune function, energy production, brain health, and disease prevention.",
    benefits: [
      "Provides sustained energy throughout the day",
      "Strengthens the immune system against infections",
      "Reduces risk of chronic diseases like diabetes and heart disease",
      "Supports healthy brain function and concentration",
      "Promotes healthy skin, hair, and nails",
      "Maintains healthy gut microbiome",
    ],
    dailyTips: [
      "Fill half your plate with vegetables and fruits",
      "Choose whole grains over refined grains (brown rice, oats)",
      "Include a protein source in every meal (lentils, fish, eggs)",
      "Limit processed foods, added sugars, and excess salt",
      "Eat a rainbow of colorful vegetables for diverse nutrients",
      "Plan meals ahead to avoid unhealthy last-minute choices",
    ],
    precautions: [
      "Avoid crash diets or extreme calorie restriction",
      "Be aware of food allergies and intolerances",
      "Don't skip meals — it can lead to overeating later",
      "Consult a nutritionist for personalized dietary advice if needed",
      "Moderation is key — occasional treats are perfectly fine",
    ],
    motivation:
      "Food is not just fuel — it's information for your body. Every bite tells your cells what to do. Choose wisely, eat colorfully, and feel the difference!",
  },
  "quality-sleep": {
    icon: Moon,
    title: "Quality Sleep",
    tagline: "Rest is not a luxury — it's a necessity.",
    description:
      "Sleep is when your body repairs itself, consolidates memories, and recharges for the next day. Poor sleep is linked to obesity, heart disease, weakened immunity, mental health issues, and reduced cognitive performance. Adults need 7–9 hours of quality sleep each night. Sleep quality matters as much as quantity — uninterrupted, deep sleep is essential for restoration.",
    benefits: [
      "Boosts immune system and speeds healing",
      "Improves memory consolidation and learning",
      "Regulates mood and reduces stress and anxiety",
      "Supports healthy metabolism and weight management",
      "Reduces risk of heart disease and diabetes",
      "Enhances creativity and problem-solving abilities",
    ],
    dailyTips: [
      "Maintain a consistent sleep schedule — even on weekends",
      "Create a dark, cool, quiet sleeping environment",
      "Avoid screens (phone, TV) at least 30 minutes before bed",
      "Limit caffeine after 2 PM and avoid heavy meals before bed",
      "Practice a relaxing bedtime routine (reading, warm bath)",
      "Get morning sunlight exposure to regulate your circadian rhythm",
    ],
    precautions: [
      "Persistent insomnia may need medical attention",
      "Avoid relying on sleeping pills long-term without consultation",
      "Sleep apnea (snoring, gasping) should be evaluated by a doctor",
      "Excessive daytime sleepiness could indicate an underlying condition",
    ],
    motivation:
      "Sleep is your superpower. It's the easiest, most effective thing you can do for your health. Prioritize it like you would any important appointment — because it is one.",
  },
  "mental-wellness": {
    icon: Brain,
    title: "Mental Wellness",
    tagline: "A healthy mind is the foundation of a healthy life.",
    description:
      "Mental wellness encompasses emotional, psychological, and social well-being. It affects how we think, feel, and act, and determines how we handle stress, relate to others, and make choices. Taking care of your mental health is just as important as physical health. Practices like mindfulness, social connection, and stress management can significantly improve your overall quality of life.",
    benefits: [
      "Reduces stress, anxiety, and risk of depression",
      "Improves focus, productivity, and decision-making",
      "Strengthens relationships and social connections",
      "Boosts resilience and ability to cope with challenges",
      "Enhances emotional regulation and self-awareness",
      "Improves physical health outcomes (lower blood pressure, better immunity)",
    ],
    dailyTips: [
      "Practice 5–10 minutes of meditation or deep breathing daily",
      "Write in a gratitude journal — list 3 things you're thankful for",
      "Take regular breaks during work (Pomodoro technique)",
      "Stay socially connected — call a friend or family member",
      "Limit social media consumption to reduce comparison stress",
      "Engage in hobbies and activities that bring you joy",
    ],
    precautions: [
      "Don't ignore persistent feelings of sadness or hopelessness",
      "Seek professional help if anxiety or depression affects daily life",
      "Avoid self-medicating with alcohol or substances",
      "It's okay to ask for help — mental health is not a weakness",
    ],
    motivation:
      "Your mind deserves the same care you give your body. Small daily practices create lasting mental strength. Be kind to yourself — you're doing better than you think.",
  },
  "regular-checkups": {
    icon: HeartPulse,
    title: "Medical Guidance",
    tagline: "Prevention is better than cure.",
    description:
      "Regular health checkups help detect potential health issues before they become serious. Routine screenings, blood tests, and physical exams can catch conditions early when they are most treatable. Even if you feel healthy, regular checkups are essential for maintaining long-term wellness and catching silent conditions like hypertension, diabetes, or cholesterol issues.",
    benefits: [
      "Early detection of diseases increases treatment success rates",
      "Helps monitor and manage existing health conditions",
      "Provides baseline health data for future comparisons",
      "Reduces healthcare costs by preventing advanced disease",
      "Gives peace of mind about your health status",
      "Builds a relationship with your healthcare provider",
    ],
    dailyTips: [
      "Schedule an annual physical exam with your doctor",
      "Keep track of your blood pressure, sugar, and cholesterol levels",
      "Get age-appropriate screenings (vision, dental, cancer)",
      "Maintain an updated record of vaccinations",
      "Monitor your weight, BMI, and vital signs regularly",
      "Don't delay doctor visits when something feels wrong",
    ],
    precautions: [
      "Don't ignore persistent or unexplained symptoms",
      "Follow up on abnormal test results promptly",
      "Inform your doctor about family history of diseases",
      "Keep a list of all medications and supplements you take",
    ],
    routine: [
      "Every 3 months: Self-monitor BP, weight, and blood sugar",
      "Every 6 months: Dental checkup and cleaning",
      "Annually: Complete blood panel, physical exam",
      "Annually: Eye examination",
      "As recommended: Cancer screenings (age/gender-specific)",
      "As needed: Specialist consultations for chronic conditions",
    ],
    motivation:
      "A checkup today could save your life tomorrow. Don't wait for symptoms — be proactive about your health. The best time to catch a problem is before it becomes one.",
  },
};

const warningSignsData = [
  "Unexplained weight loss or gain",
  "Persistent fatigue that doesn't improve with rest",
  "Frequent headaches or dizziness",
  "Shortness of breath during normal activities",
  "Chest pain or irregular heartbeat",
  "Changes in skin, moles, or unusual lumps",
  "Persistent digestive issues (bloating, pain, changes in bowel habits)",
  "Frequent infections or slow wound healing",
];

const HealthTipDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const tip = slug ? healthTipData[slug] : null;
  if (!tip) return <Navigate to="/" replace />;

  const Icon = tip.icon;
  const isCheckup = slug === "regular-checkups";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        {/* Hero */}
        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">{tip.title}</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">{tip.tagline}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <p className="text-foreground leading-relaxed">{tip.description}</p>
        </section>

        {/* Benefits */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> Key Benefits
          </h2>
          <ul className="space-y-3">
            {tip.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Daily tips */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Practical Daily Tips
          </h2>
          <ul className="space-y-3">
            {tip.dailyTips.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Routine (if exists) */}
        {tip.routine && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {isCheckup ? "Recommended Checkup Schedule" : "Suggested Weekly Routine"}
            </h2>
            <ul className="space-y-3">
              {tip.routine.map((r, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Warning signs (checkup page only) */}
        {isCheckup && (
          <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-card mb-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Warning Signs — When to See a Doctor
            </h2>
            <ul className="space-y-3">
              {warningSignsData.map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{w}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Precautions */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Precautions
          </h2>
          <ul className="space-y-3">
            {tip.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Motivation */}
        <section className="rounded-xl gradient-primary p-6 shadow-elevated mb-8 text-primary-foreground">
          <h2 className="font-display text-lg font-bold mb-2">💪 Stay Motivated</h2>
          <p className="text-primary-foreground/90 leading-relaxed">{tip.motivation}</p>
        </section>

        <div className="text-center mb-8">
          <Button onClick={() => navigate("/")} className="px-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default HealthTipDetail;
