import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { getHistory } from "@/lib/prediction";
import { ArrowLeft, Dumbbell, Clock, Shield, Star, Activity } from "lucide-react";

interface Exercise {
  name: string;
  benefit: string;
  duration: string;
  frequency: string;
  precaution: string;
}

const defaultPlan: Exercise[] = [
  { name: "Morning Stretching", benefit: "Improves flexibility and wakes up muscles", duration: "10 min", frequency: "Daily", precaution: "Don't bounce while stretching" },
  { name: "Brisk Walking", benefit: "Boosts cardiovascular health and mood", duration: "30 min", frequency: "5 days/week", precaution: "Wear proper footwear, stay hydrated" },
  { name: "Deep Breathing (Pranayama)", benefit: "Reduces stress, improves lung capacity", duration: "10 min", frequency: "Daily", precaution: "Stop if you feel dizzy" },
  { name: "Cat-Cow Pose (Yoga)", benefit: "Relieves back tension, improves posture", duration: "5 min", frequency: "Daily", precaution: "Avoid if you have severe spinal issues" },
  { name: "Bodyweight Squats", benefit: "Strengthens legs and core muscles", duration: "10 min", frequency: "3-4 days/week", precaution: "Keep knees aligned with toes" },
  { name: "Tree Pose (Vrikshasana)", benefit: "Improves balance and concentration", duration: "5 min per side", frequency: "Daily", precaution: "Use wall support if needed" },
  { name: "Jumping Jacks", benefit: "Full-body cardio for energy and stamina", duration: "5-10 min", frequency: "4 days/week", precaution: "Avoid on hard surfaces if you have joint issues" },
  { name: "Shavasana (Corpse Pose)", benefit: "Deep relaxation and mental recovery", duration: "10 min", frequency: "Daily", precaution: "Do at end of exercise session" },
];

const diseaseExercises: Record<string, Exercise[]> = {
  "Hypertension": [
    { name: "Slow Walking", benefit: "Lowers blood pressure gradually", duration: "20-30 min", frequency: "Daily", precaution: "Avoid heavy lifting or breath-holding exercises" },
    { name: "Anulom Vilom (Alternate Nostril Breathing)", benefit: "Calms the nervous system, reduces BP", duration: "10 min", frequency: "Twice daily", precaution: "Breathe gently, don't force" },
    { name: "Gentle Cycling", benefit: "Low-impact cardio for heart health", duration: "20 min", frequency: "4 days/week", precaution: "Monitor heart rate, stop if chest pain" },
    { name: "Seated Forward Bend", benefit: "Relaxes the mind and body", duration: "5 min", frequency: "Daily", precaution: "Don't force the stretch" },
  ],
  "Diabetes": [
    { name: "Post-Meal Walking", benefit: "Helps regulate blood sugar after eating", duration: "15-20 min", frequency: "After each meal", precaution: "Carry glucose tablets in case of hypoglycemia" },
    { name: "Resistance Band Training", benefit: "Improves insulin sensitivity", duration: "20 min", frequency: "3 days/week", precaution: "Start light, monitor blood sugar" },
    { name: "Sun Salutation (Surya Namaskar)", benefit: "Full-body workout improving metabolism", duration: "15 min", frequency: "Daily", precaution: "Do slowly if beginner, check sugar before/after" },
    { name: "Leg Raises", benefit: "Strengthens core and improves circulation", duration: "10 min", frequency: "4 days/week", precaution: "Support lower back during exercise" },
  ],
  "Migraine": [
    { name: "Neck & Shoulder Stretches", benefit: "Releases tension that triggers migraines", duration: "10 min", frequency: "Twice daily", precaution: "Gentle movements only; avoid jerking" },
    { name: "Child's Pose (Balasana)", benefit: "Relieves head tension and calms the mind", duration: "5 min", frequency: "During onset", precaution: "Skip if it increases headache" },
    { name: "Slow Deep Breathing", benefit: "Reduces stress-triggered migraines", duration: "10 min", frequency: "3 times/day", precaution: "Practice in a quiet, dark room" },
    { name: "Gentle Yoga Flow", benefit: "Reduces migraine frequency over time", duration: "20 min", frequency: "4 days/week", precaution: "Avoid inversions during active migraine" },
  ],
  "Gastroenteritis": [
    { name: "Gentle Walking", benefit: "Aids digestion without strain", duration: "10-15 min", frequency: "When feeling better", precaution: "Rest first; avoid exercise during acute phase" },
    { name: "Seated Spinal Twist", benefit: "Stimulates digestive organs gently", duration: "5 min", frequency: "Once daily", precaution: "Only when symptoms are subsiding" },
    { name: "Deep Belly Breathing", benefit: "Relaxes abdominal muscles", duration: "10 min", frequency: "Twice daily", precaution: "Do lying down if weak" },
  ],
  "Pneumonia": [
    { name: "Pursed Lip Breathing", benefit: "Improves lung function during recovery", duration: "5-10 min", frequency: "3 times/day", precaution: "Stop if short of breath; consult doctor" },
    { name: "Gentle Arm Raises", benefit: "Expands chest and improves breathing", duration: "5 min", frequency: "Twice daily", precaution: "Only during recovery phase" },
    { name: "Slow Short Walks", benefit: "Rebuilds stamina gradually", duration: "5-10 min", frequency: "As tolerated", precaution: "Don't overexert; rest frequently" },
  ],
  "Anxiety Disorder": [
    { name: "Box Breathing", benefit: "Activates parasympathetic nervous system", duration: "5 min", frequency: "When anxious or 3x daily", precaution: "Breathe naturally, don't hyperventilate" },
    { name: "Progressive Muscle Relaxation", benefit: "Releases physical tension from anxiety", duration: "15 min", frequency: "Daily before bed", precaution: "Don't tense injured muscles" },
    { name: "Yoga Nidra", benefit: "Deep relaxation reducing anxiety levels", duration: "20 min", frequency: "Daily", precaution: "Find a quiet space; use guided audio" },
    { name: "Nature Walk", benefit: "Reduces cortisol and calms the mind", duration: "20-30 min", frequency: "Daily", precaution: "Choose calm, green environments" },
  ],
};

const ExerciseRecommendation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [latestDisease, setLatestDisease] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>(defaultPlan);

  useEffect(() => {
    const history = getHistory();
    if (history.length > 0) {
      const latest = history[0].disease;
      setLatestDisease(latest);
      const matched = Object.entries(diseaseExercises).find(([d]) => latest.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(latest.toLowerCase()));
      if (matched) setExercises(matched[1]);
    }
  }, []);

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const isPersonalized = latestDisease !== null && exercises !== defaultPlan;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Dumbbell className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Exercise & Yoga Guide</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {isPersonalized ? `Personalized for: ${latestDisease}` : "General wellness plan for beginners"}
              </p>
            </div>
          </div>
        </div>

        {isPersonalized && (
          <div className="rounded-xl border border-primary/20 bg-secondary p-4 mb-6 flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              Based on your recent prediction (<strong>{latestDisease}</strong>), we've customized these exercises to support your recovery. Always consult your doctor before starting.
            </p>
          </div>
        )}

        <section className="space-y-4 mb-8">
          {exercises.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Star className="h-4 w-4" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{ex.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{ex.benefit}</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                  <Clock className="h-3 w-3" /> {ex.duration}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                  <Activity className="h-3 w-3" /> {ex.frequency}
                </span>
              </div>
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <span>{ex.precaution}</span>
              </div>
            </div>
          ))}
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

export default ExerciseRecommendation;
