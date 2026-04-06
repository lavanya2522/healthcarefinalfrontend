import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { getAllSymptoms, predictDisease, addToHistory, PredictionResult } from "@/lib/prediction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, X, AlertCircle, CheckCircle2, Lightbulb, ArrowRight, Mic, MicOff,
  Shield, Heart, Stethoscope, AlertTriangle, Home, ListChecks, Apple, Ban, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const token = localStorage.getItem("token");

  if (!token) { return <Navigate to="/login" replace />; }

  const allSymptoms = getAllSymptoms();
  const filtered = query
    ? allSymptoms.filter((s) => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s))
    : [];

  const addSymptom = (s: string) => {
    setSelected((prev) => prev.includes(s) ? prev : [...prev, s]);
    setQuery("");
  };

  const removeSymptom = (s: string) => {
    setSelected((prev) => prev.filter((x) => x !== s));
  };

  const tamilToEnglish: Record<string, string> = {
    "காய்ச்சல்": "fever", "இருமல்": "cough", "தலைவலி": "headache",
    "தும்மல்": "sneezing", "மூக்கொழுகுதல்": "runny nose", "தொண்டை வலி": "sore throat",
    "உடல் வலி": "body ache", "சோர்வு": "fatigue", "குளிர்": "chills",
    "குமட்டல்": "nausea", "வாந்தி": "vomiting", "வயிற்றுப்போக்கு": "diarrhea",
    "வயிற்று வலி": "stomach cramps", "மயக்கம்": "dizziness",
    "மூச்சுத்திணறல்": "shortness of breath", "நெஞ்சு வலி": "chest pain",
    "கண் எரிச்சல்": "itchy eyes", "கண்ணீர்": "watery eyes",
    "தூக்கமின்மை": "insomnia", "பதட்டம்": "restlessness",
    "அதிக தாகம்": "excessive thirst", "அடிக்கடி சிறுநீர்": "frequent urination",
    "மங்கலான பார்வை": "blurred vision", "எடை குறைவு": "weight loss",
    "சளி": "congestion", "சிறு காய்ச்சல்": "mild fever",
    "அதிக காய்ச்சல்": "high fever", "கடுமையான தலைவலி": "severe headache",
    "ஒளி உணர்வு": "sensitivity to light", "தசை இறுக்கம்": "muscle tension",
    "இதயம் வேகமாக அடித்தல்": "rapid heartbeat", "கவலை": "excessive worry",
    "கவனம் சிதறல்": "difficulty concentrating", "நீர்ச்சத்து குறைவு": "dehydration",
    "சிறுநீர் எரிச்சல்": "painful urination", "மெதுவாக குணமடைதல்": "slow healing",
    "சீழ்": "mucus", "தொடர் இருமல்": "persistent cough",
    "நெஞ்சு அசௌகரியம்": "chest discomfort", "சிறுநீர் கலங்கல்": "cloudy urine",
    "கீழ் வயிற்று வலி": "lower abdominal pain",
  };

  const translateTamilToEnglish = (tamilText: string): string[] => {
    const foundEnglish: string[] = [];
    const lowerTamil = tamilText.toLowerCase();
    for (const [tamil, english] of Object.entries(tamilToEnglish)) {
      if (lowerTamil.includes(tamil)) foundEnglish.push(english);
    }
    for (const symptom of allSymptoms) {
      if (lowerTamil.includes(symptom.toLowerCase()) && !foundEnglish.includes(symptom.toLowerCase())) {
        foundEnglish.push(symptom.toLowerCase());
      }
    }
    return foundEnglish;
  };

  const processTranscript = (text: string) => {
    const englishSymptoms = translateTamilToEnglish(text);
    const matchedSymptoms = allSymptoms.filter((s) =>
      englishSymptoms.some((es) => s.toLowerCase().includes(es) || es.includes(s.toLowerCase()))
    );
    const newSymptoms = matchedSymptoms.filter((s) => !selected.includes(s));
    if (newSymptoms.length > 0) {
      setSelected((prev) => [...prev, ...newSymptoms.filter((s) => !prev.includes(s))]);
      toast({ title: "Symptoms detected!", description: `Matched: ${newSymptoms.join(", ")}` });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
      toast({ title: "Recording stopped", description: "Processing complete." });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        setQuery(transcript.trim());
        processTranscript(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        toast({ title: "Voice Error", description: `Error: ${event.error}`, variant: "destructive" });
      }
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
      toast({ title: "🎙️ Listening...", description: "Speak your symptoms in Tamil. Tap mic again to stop." });
    } catch {
      toast({ title: "Voice Error", description: "Could not start microphone.", variant: "destructive" });
      stopRecording();
    }
  };

  const handlePredict = () => {
    if (selected.length < 2) {
      toast({ title: "Select at least 2 symptoms", description: "More symptoms lead to more accurate predictions.", variant: "destructive" });
      return;
    }
    const predictions = predictDisease(selected);
    setResults(predictions);
    setShowResults(true);

    if (predictions.length > 0) {
      const top = predictions[0];
      addToHistory({
        disease: top.disease,
        symptoms: selected,
        confidence: top.confidence,
        suggestion: top.suggestion,
        allResults: predictions.map((p) => ({ disease: p.disease, confidence: p.confidence })),
        homeCare: top.homeCare,
        precautions: top.precautions,
        urgency: top.urgency,
        tasks: top.tasks.map((t) => ({ text: t, done: false })),
      });
    }
  };

  const reset = () => {
    setSelected([]);
    setResults([]);
    setShowResults(false);
    setQuery("");
  };

  const urgencyConfig = {
    low: { color: "bg-emerald-500/10 text-emerald-600", label: "Self-care at home", icon: Home },
    moderate: { color: "bg-amber-500/10 text-amber-600", label: "Monitor & consult if needed", icon: AlertTriangle },
    high: { color: "bg-red-500/10 text-red-600", label: "Consult a doctor soon", icon: Stethoscope },
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1 animate-fade-in">Symptom-Based Prediction</h1>
        <p className="text-muted-foreground mb-6 animate-fade-in">Select your symptoms for an AI-powered disease prediction with explainable insights.</p>

        {!showResults ? (
          <div className="animate-fade-in space-y-6">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                    {s}
                    <button onClick={() => removeSymptom(s)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full rounded-xl border border-input bg-card px-10 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type to search symptoms or tap mic to speak in Tamil..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={toggleVoiceRecording}
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors ${
                  isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-secondary"
                }`}
                title={isRecording ? "Stop recording" : "Record voice (Tamil)"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            {filtered.length > 0 && (
              <div className="rounded-xl border border-border bg-card shadow-card max-h-48 overflow-y-auto">
                {filtered.map((s) => (
                  <button key={s} onClick={() => addSymptom(s)} className="w-full text-left px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Or choose from common symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {allSymptoms.filter((s) => !selected.includes(s)).map((s) => (
                    <button key={s} onClick={() => addSymptom(s)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-card-foreground hover:bg-secondary hover:border-primary/30 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handlePredict} className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" size="lg">
              <Search className="mr-2 h-4 w-4" /> Predict Disease
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {results.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-display font-semibold text-foreground">No Match Found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try selecting different symptoms for better results.</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Prediction Summary — {selected.length} symptoms analyzed</p>
                  <div className="flex flex-wrap gap-3">
                    {results.map((r, i) => (
                      <div key={r.disease} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${i === 0 ? "bg-primary/10 text-primary font-semibold" : "bg-secondary text-secondary-foreground"}`}>
                        <span>{i === 0 ? "🏥" : `#${i + 1}`}</span>
                        <span>{r.disease}</span>
                        <span className="font-bold">{r.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {results.map((r, i) => {
                  const urg = urgencyConfig[r.urgency];
                  const UrgIcon = urg.icon;
                  return (
                    <div key={r.disease} className={`rounded-xl border bg-card shadow-card overflow-hidden ${i === 0 ? "border-primary/30 shadow-elevated" : "border-border"}`}>
                      {/* Header */}
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {i === 0 && <span className="text-xs font-semibold text-primary mb-1 block">🎯 Most Likely</span>}
                            <h3 className="font-display text-lg font-bold text-card-foreground">{r.disease}</h3>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                            r.confidence >= 60 ? "bg-destructive/10 text-destructive"
                              : r.confidence >= 35 ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {r.confidence}%
                          </div>
                        </div>

                        {/* Urgency badge */}
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${urg.color}`}>
                          <UrgIcon className="h-3.5 w-3.5" />
                          {urg.label}
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="mx-5 mb-3 rounded-lg bg-secondary/50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground mb-2">
                          <Lightbulb className="h-4 w-4" /> Why this prediction?
                        </div>
                        <ul className="space-y-1">
                          {r.explanation.map((e, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                              {e.startsWith("⚠️") ? (
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                              ) : e.includes("strong indicator") ? (
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              )}
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Only show detailed sections for top result */}
                      {i === 0 && (
                        <div className="px-5 pb-5 space-y-3">
                          {/* Doctor Visit Alert — shown first for high urgency */}
                          <div className={`rounded-lg border p-3 ${
                            r.urgency === "high"
                              ? "bg-destructive/5 border-destructive/30"
                              : r.urgency === "moderate"
                              ? "bg-amber-500/5 border-amber-500/30"
                              : "bg-emerald-500/5 border-emerald-500/30"
                          }`}>
                            <div className={`flex items-center gap-2 text-xs font-semibold mb-2 ${
                              r.urgency === "high" ? "text-destructive" : r.urgency === "moderate" ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              <Clock className="h-3.5 w-3.5" />
                              {r.urgency === "high" ? "🚨 Doctor Visit — Urgent" : r.urgency === "moderate" ? "🩺 When to See a Doctor" : "📋 Doctor Visit Guidance"}
                            </div>
                            <p className={`text-sm font-medium ${r.urgency === "high" ? "text-destructive" : "text-card-foreground"}`}>
                              {r.doctorVisitAdvice}
                            </p>
                          </div>

                          {/* Home Care */}
                          <div className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-card-foreground mb-2">
                              <Home className="h-3.5 w-3.5 text-emerald-500" /> Home Care Tips
                            </div>
                            <ul className="space-y-1">
                              {r.homeCare.map((tip, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <Heart className="h-3 w-3 mt-0.5 text-pink-400 shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended Foods */}
                          <div className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-card-foreground mb-2">
                              <Apple className="h-3.5 w-3.5 text-emerald-500" /> 🍎 Recommended Healthy Foods
                            </div>
                            <ul className="space-y-1">
                              {r.recommendedFoods.map((food, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-400 shrink-0" />
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Foods to Avoid */}
                          <div className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-card-foreground mb-2">
                              <Ban className="h-3.5 w-3.5 text-destructive" /> 🚫 Foods to Avoid
                            </div>
                            <ul className="space-y-1">
                              {r.foodsToAvoid.map((food, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <X className="h-3 w-3 mt-0.5 text-destructive/60 shrink-0" />
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Precautions */}
                          <div className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-card-foreground mb-2">
                              <Shield className="h-3.5 w-3.5 text-amber-500" /> Precautions
                            </div>
                            <ul className="space-y-1">
                              {r.precautions.map((p, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-400 shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tasks */}
                          <div className="rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-card-foreground mb-2">
                              <ListChecks className="h-3.5 w-3.5 text-primary" /> Suggested Actions
                            </div>
                            <ul className="space-y-1.5">
                              {r.tasks.map((task, j) => (
                                <li key={j} className="text-xs text-card-foreground flex items-start gap-2">
                                  <span className="mt-0.5 h-3.5 w-3.5 rounded-full border border-primary/40 shrink-0 flex items-center justify-center text-[8px] text-primary font-bold">{j + 1}</span>
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommendation */}
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                            <p className="text-xs font-semibold text-primary mb-1">💡 Recommendation</p>
                            <p className="text-sm text-card-foreground">{r.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">New Prediction</Button>
              <Button onClick={() => navigate("/history")} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">
                View History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
