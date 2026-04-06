import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SearchPage from "./pages/SearchPage";
import HistoryPage from "./pages/HistoryPage";
import HealthTipDetail from "./pages/HealthTipDetail";
import HydrationReminder from "./pages/HydrationReminder";
import ExerciseRecommendation from "./pages/ExerciseRecommendation";
import BMICalculator from "./pages/BMICalculator";
import MentalWellnessGuide from "./pages/MentalWellnessGuide";
import NotFound from "./pages/NotFound";
import HealthChatbot from "./components/HealthChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/hydration" element={<HydrationReminder />} />
            <Route path="/exercise" element={<ExerciseRecommendation />} />
            <Route path="/bmi" element={<BMICalculator />} />
            <Route path="/mental-wellness" element={<MentalWellnessGuide />} />
            <Route path="/tips/:slug" element={<HealthTipDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <HealthChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
