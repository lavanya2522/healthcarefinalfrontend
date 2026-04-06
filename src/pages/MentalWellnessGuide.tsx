import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Wind, Eye, Smile, Sun, Heart, Sparkles } from "lucide-react";

const sections = [
  {
    icon: Wind,
    title: "Deep Breathing Exercises",
    tips: [
      "4-7-8 Breathing: Inhale for 4 seconds, hold for 7, exhale slowly for 8. Repeat 4 times.",
      "Box Breathing: Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec. Great for instant calm.",
      "Belly Breathing: Place hand on belly, breathe deeply so your belly rises. Practice 5 minutes daily.",
    ],
  },
  {
    icon: Eye,
    title: "Mindfulness & Meditation",
    tips: [
      "Start with 5 minutes of sitting quietly, focusing only on your breath.",
      "Body Scan: Close your eyes and slowly notice sensations from head to toes.",
      "Mindful Eating: Focus on the taste, texture, and smell of each bite during meals.",
      "Use guided meditation apps or videos if you're a beginner.",
    ],
  },
  {
    icon: Sparkles,
    title: "Stress Relief Techniques",
    tips: [
      "Progressive Muscle Relaxation: Tense each muscle group for 5 seconds, then release.",
      "Journaling: Write down 3 things you're grateful for each evening.",
      "Take a 10-minute walk in nature — green spaces reduce cortisol levels.",
      "Listen to calming music or nature sounds during breaks.",
    ],
  },
  {
    icon: Sun,
    title: "Improving Focus & Concentration",
    tips: [
      "Pomodoro Technique: Work for 25 minutes, then take a 5-minute break.",
      "Reduce multitasking — focus on one task at a time for better results.",
      "Limit screen time and social media during work or study hours.",
      "Get morning sunlight for 10–15 minutes to boost alertness naturally.",
    ],
  },
  {
    icon: Heart,
    title: "Daily Positive Habits",
    tips: [
      "Start each day with a positive affirmation or intention.",
      "Connect with someone you care about — a call, text, or hug.",
      "Spend 15 minutes on a hobby that brings you joy.",
      "Practice saying 'no' to protect your energy and boundaries.",
      "End each day by reflecting on one thing that went well.",
    ],
  },
  {
    icon: Smile,
    title: "Creating a Calm & Pleasant Mind",
    tips: [
      "Declutter your living and work space — outer order creates inner calm.",
      "Reduce caffeine intake after 2 PM to improve relaxation and sleep.",
      "Practice digital detox for 1 hour before bed.",
      "Laugh daily — watch something funny or spend time with cheerful people.",
      "Accept what you can't control and focus your energy on what you can.",
    ],
  },
];

const MentalWellnessGuide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Brain className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Mental Wellness Guide</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Practical tips for a calm, focused, and happy mind</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {sections.map((section, i) => {
            const SIcon = section.icon;
            return (
              <section key={i} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <SIcon className="h-5 w-5 text-primary" /> {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.tips.map((tip, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                        {j + 1}
                      </span>
                      <span className="text-muted-foreground text-sm leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="rounded-xl gradient-primary p-6 shadow-elevated mb-8 text-primary-foreground">
          <h2 className="font-display text-lg font-bold mb-2">🧘 Remember</h2>
          <p className="text-primary-foreground/90 leading-relaxed">
            Mental wellness is a journey, not a destination. Small daily habits create lasting change. Be patient with yourself — every mindful moment counts.
          </p>
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

export default MentalWellnessGuide;
