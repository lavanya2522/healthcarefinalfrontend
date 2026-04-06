import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  isValidEmail,
  getEmailError,
  isEmailRegistered,
  registerEmail,
} from "@/lib/emailValidator";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailError = emailTouched ? getEmailError(email) : "";
  const isEmailValid = isValidEmail(email);
  const isEmailAlreadyRegistered = email && isEmailRegistered(email);
  const passwordsMatch = password === confirm;
  const isPasswordValid = password.length >= 6;

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // 🚫 prevent duplicate calls
    setLoading(true);
    // Validate name
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description:
          getEmailError(email) || "Please enter a valid email address.",
        variant: "destructive",
      });
      setLoading(false);
      setEmailTouched(true);
      return;
    }

    // Check if email already registered
    if (isEmailAlreadyRegistered) {
      toast({
        title: "Email Already Registered",
        description:
          "This email is already registered. Please use a different email.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate password
    if (!isPasswordValid) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      setLoading(false);
      setPasswordTouched(true);
      return;
    }

    // Validate password match
    if (!passwordsMatch) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create account
    const res = await signup(name, email, password);

    if (res.success) {
      toast({ title: "Account created!", description: "Welcome aboard!" });
      navigate("/");
    } else {
      toast({
        title: "Signup failed",
        description: "Something went wrong",
        variant: "destructive",
      });
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
          <h1 className="font-display text-3xl font-bold text-foreground">
            Create Account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start your health journey today
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="John Doe"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 pr-10 ${
                  emailTouched && emailError
                    ? "border-destructive"
                    : emailTouched && isEmailValid && !isEmailAlreadyRegistered
                    ? "border-emerald-500"
                    : emailTouched && isEmailAlreadyRegistered
                    ? "border-amber-500"
                    : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required
              />
              {emailTouched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isEmailAlreadyRegistered ? (
                    <AlertCircle
                      className="h-5 w-5 text-amber-500"
                      title="Email already registered"
                    />
                  ) : isEmailValid ? (
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-500"
                      title="Email is valid"
                    />
                  ) : (
                    <XCircle
                      className="h-5 w-5 text-destructive"
                      title="Invalid email"
                    />
                  )}
                </div>
              )}
            </div>
            {emailTouched && isEmailAlreadyRegistered && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> This email is already
                registered
              </p>
            )}
            {emailTouched && emailError && !isEmailAlreadyRegistered && (
              <p className="text-xs text-destructive font-medium flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> {emailError}
              </p>
            )}
            {emailTouched && isEmailValid && !isEmailAlreadyRegistered && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Email is valid and
                available
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`pl-10 pr-10 ${
                  passwordTouched && !isPasswordValid
                    ? "border-destructive"
                    : passwordTouched && isPasswordValid
                    ? "border-emerald-500"
                    : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                required
              />
              {passwordTouched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isPasswordValid ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {passwordTouched && !isPasswordValid && (
              <p className="text-xs text-destructive font-medium">
                Password must be at least 6 characters
              </p>
            )}
            {passwordTouched && isPasswordValid && (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ Password is strong
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                className={`pl-10 pr-10 ${
                  confirm && !passwordsMatch
                    ? "border-destructive"
                    : confirm && passwordsMatch
                    ? "border-emerald-500"
                    : ""
                }`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {confirm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {confirm && !passwordsMatch && (
              <p className="text-xs text-destructive font-medium">
                Passwords do not match
              </p>
            )}
            {confirm && passwordsMatch && (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ Passwords match
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              !isEmailValid ||
              !isPasswordValid ||
              !passwordsMatch ||
              !name.trim() ||
              isEmailAlreadyRegistered ||
              loading
            }
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
                     {loading ? "loading..." : "Create Account"}
 
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
