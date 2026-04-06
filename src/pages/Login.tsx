import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isValidEmail, getEmailError } from "@/lib/emailValidator";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailError = emailTouched ? getEmailError(email) : "";
  const isEmailValid = isValidEmail(email);

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
      if (loading) return; // 🚫 prevent duplicate calls
      setLoading(true);
    // Validate email
    if (!isValidEmail(email)) {
      toast({ title: "Invalid Email", description: getEmailError(email) || "Please enter a valid email address.", variant: "destructive" });
      setEmailTouched(true);
      setLoading(false);
      return;
    }

    // Validate password
    if (!password) {
      toast({ title: "Error", description: "Password is required.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const res = await login(email, password);

    if (res.success) {
      navigate("/");
    } else {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    }
    setLoading(false);

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your health dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                className={`pl-10 pr-10 ${emailTouched && emailError ? "border-destructive" : emailTouched && isEmailValid ? "border-emerald-500" : ""}`}
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required 
              />
              {emailTouched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isEmailValid ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" title="Email is valid" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" title="Invalid email" />
                  )}
                </div>
              )}
            </div>
            {emailTouched && emailError && (
              <p className="text-xs text-destructive font-medium">{emailError}</p>
            )}
            {emailTouched && isEmailValid && (
              <p className="text-xs text-emerald-600 font-medium">✓ Email looks good!</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!isEmailValid || !password || loading}
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
          {loading ? "Logging in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
