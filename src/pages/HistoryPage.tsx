import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { getHistory, toggleComplete, toggleTask, PredictionRecord } from "@/lib/prediction";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Calendar, Activity, Trash2, ChevronDown, ChevronUp, Stethoscope, AlertTriangle, Home as HomeIcon } from "lucide-react";

const urgencyConfig = {
  low: { color: "bg-emerald-500/10 text-emerald-600", label: "Self-care" },
  moderate: { color: "bg-amber-500/10 text-amber-600", label: "Monitor" },
  high: { color: "bg-red-500/10 text-red-600", label: "See doctor" },
};

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);
  const token = localStorage.getItem("token");
  if (!token) { return <Navigate to="/login" replace />; }

  const handleToggle = (id: string) => {
    toggleComplete(id);
    setHistory(getHistory());
  };

  const handleTaskToggle = (recordId: string, taskIndex: number) => {
    toggleTask(recordId, taskIndex);
    setHistory(getHistory());
  };

  const clearHistory = () => {
    localStorage.removeItem("health_history");
    setHistory([]);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Prediction History</h1>
            <p className="text-sm text-muted-foreground">{history.length} prediction{history.length !== 1 ? "s" : ""} saved</p>
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="mr-1 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card animate-fade-in">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-display font-semibold text-foreground">No predictions yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Start by predicting a disease from your symptoms.</p>
            <Button onClick={() => navigate("/search")} className="gradient-primary text-primary-foreground hover:opacity-90">
              Make a Prediction
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {history.map((record) => {
              const isExpanded = expandedId === record.id;
              const urg = record.urgency ? urgencyConfig[record.urgency] : null;
              const tasksDone = record.tasks ? record.tasks.filter((t) => t.done).length : 0;
              const tasksTotal = record.tasks ? record.tasks.length : 0;

              return (
                <div key={record.id} className={`rounded-xl border bg-card shadow-card transition-all ${record.completed ? "border-emerald-500/30 opacity-80" : "border-border"}`}>
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-card-foreground">{record.disease}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            record.confidence >= 60 ? "bg-destructive/10 text-destructive"
                              : record.confidence >= 35 ? "bg-amber-500/10 text-amber-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {record.confidence}% match
                          </span>
                          {urg && (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urg.color}`}>
                              {urg.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : record.id)} className="text-muted-foreground hover:text-foreground p-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Other predictions */}
                    {record.allResults && record.allResults.length > 1 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {record.allResults.slice(1).map((r) => (
                          <span key={r.disease} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                            {r.disease} {r.confidence}%
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="text-xs font-medium text-card-foreground">Symptoms:</span>{" "}
                      {record.symptoms.join(", ")}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3 border-t border-border pt-3">
                      {/* Tasks */}
                      {record.tasks && record.tasks.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-card-foreground mb-2 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-primary" />
                            Tasks ({tasksDone}/{tasksTotal} completed)
                          </p>
                          <div className="space-y-1.5">
                            {record.tasks.map((task, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleTaskToggle(record.id, idx)}
                                className="flex items-start gap-2 w-full text-left group"
                              >
                                {task.done ? (
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                                )}
                                <span className={`text-xs ${task.done ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                                  {task.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Home care */}
                      {record.homeCare && record.homeCare.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-card-foreground mb-1.5 flex items-center gap-1.5">
                            <HomeIcon className="h-3.5 w-3.5 text-emerald-500" /> Home Care
                          </p>
                          <ul className="space-y-1">
                            {record.homeCare.map((tip, j) => (
                              <li key={j} className="text-xs text-muted-foreground">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Precautions */}
                      {record.precautions && record.precautions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-card-foreground mb-1.5 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Precautions
                          </p>
                          <ul className="space-y-1">
                            {record.precautions.map((p, j) => (
                              <li key={j} className="text-xs text-muted-foreground">⚠️ {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggestion */}
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                        <p className="text-xs font-semibold text-primary mb-1">Recommendation</p>
                        <p className="text-xs text-card-foreground">{record.suggestion}</p>
                      </div>
                    </div>
                  )}

                  {/* Quick action bar */}
                  {!isExpanded && record.tasks && record.tasks.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{tasksDone}/{tasksTotal} tasks</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
