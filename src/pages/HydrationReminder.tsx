import { useState, useEffect, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplets, CheckCircle2, Circle, Bell, BellOff, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "hydration_state";
const GLASS_COUNT = 8;

interface HydrationState {
  wakeTime: string;
  sleepTime: string;
  completed: boolean[];
  date: string;
}

const getToday = () => new Date().toISOString().split("T")[0];

const loadState = (): HydrationState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as HydrationState;
    if (s.date !== getToday()) return null;
    return s;
  } catch { return null; }
};

const saveState = (s: HydrationState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

function computeSchedule(wake: string, sleep: string): string[] {
  const [wh, wm] = wake.split(":").map(Number);
  const [sh, sm] = sleep.split(":").map(Number);
  let wakeMin = wh * 60 + wm;
  let sleepMin = sh * 60 + sm;
  if (sleepMin <= wakeMin) sleepMin += 24 * 60;
  const interval = (sleepMin - wakeMin) / GLASS_COUNT;
  return Array.from({ length: GLASS_COUNT }, (_, i) => {
    const totalMin = wakeMin + Math.round(interval * i);
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  });
}

const HydrationReminder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [completed, setCompleted] = useState<boolean[]>(Array(GLASS_COUNT).fill(false));
  const [schedule, setSchedule] = useState<string[]>([]);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setWakeTime(saved.wakeTime);
      setSleepTime(saved.sleepTime);
      setCompleted(saved.completed);
      setSchedule(computeSchedule(saved.wakeTime, saved.sleepTime));
      setHasSetup(true);
    }
  }, []);

  const persist = useCallback((c: boolean[], w: string, s: string) => {
    saveState({ wakeTime: w, sleepTime: s, completed: c, date: getToday() });
  }, []);
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const handleSetSchedule = () => {
    const s = computeSchedule(wakeTime, sleepTime);
    const c = Array(GLASS_COUNT).fill(false);
    setSchedule(s);
    setCompleted(c);
    setHasSetup(true);
    persist(c, wakeTime, sleepTime);
    toast({ title: "Hydration schedule set!", description: `${GLASS_COUNT} reminders from ${wakeTime} to ${sleepTime}` });
  };

  const toggleGlass = (i: number) => {
    const next = [...completed];
    next[i] = !next[i];
    setCompleted(next);
    persist(next, wakeTime, sleepTime);
    if (next[i]) toast({ title: `Glass ${i + 1} done! 💧`, description: `${next.filter(Boolean).length}/${GLASS_COUNT} completed` });
  };

  const toggleNotifications = async () => {
    if (!notificationsOn && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast({ title: "Notifications blocked", variant: "destructive" }); return; }
    }
    setNotificationsOn(!notificationsOn);
    toast({ title: notificationsOn ? "Notifications off" : "Notifications on" });
  };

  const done = completed.filter(Boolean).length;
  const pct = Math.round((done / GLASS_COUNT) * 100);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        {/* Hero */}
        <div className="rounded-2xl gradient-hero p-8 text-primary-foreground shadow-elevated mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <Droplets className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Smart Hydration Reminder</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Stay on track with your daily water intake</p>
            </div>
          </div>
        </div>

        {/* Setup */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Set Your Schedule
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Wake-up Time</label>
              <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Sleep Time</label>
              <Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSetSchedule} className="flex-1">Generate {GLASS_COUNT} Reminders</Button>
            <Button variant="outline" size="icon" onClick={toggleNotifications} title="Toggle notifications">
              {notificationsOn ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </section>

        {/* Progress */}
        {hasSetup && (
          <>
            <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Today's Progress</h2>
                <span className="text-sm font-semibold text-primary">{done}/{GLASS_COUNT} glasses</span>
              </div>
              <Progress value={pct} className="h-3 mb-2" />
              <p className="text-xs text-muted-foreground text-right">{pct}% completed</p>
              {pct === 100 && (
                <div className="mt-4 rounded-lg bg-secondary p-4 text-center">
                  <p className="font-display font-bold text-foreground">🎉 Amazing! You've hit your daily hydration goal!</p>
                </div>
              )}
            </section>

            {/* Schedule */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-card mb-8">
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" /> Daily Hydration Schedule
              </h2>
              <ul className="space-y-3">
                {schedule.map((time, i) => (
                  <li
                    key={i}
                    onClick={() => toggleGlass(i)}
                    className={`flex items-center gap-4 rounded-lg p-3 cursor-pointer transition-all ${
                      completed[i]
                        ? "bg-secondary border border-primary/20"
                        : "bg-muted/30 border border-border hover:border-primary/30"
                    }`}
                  >
                    {completed[i] ? (
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`font-medium ${completed[i] ? "text-foreground line-through" : "text-foreground"}`}>
                        Glass {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">— {time}</span>
                    </div>
                    <Droplets className={`h-4 w-4 ${completed[i] ? "text-primary" : "text-muted-foreground/40"}`} />
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

export default HydrationReminder;
