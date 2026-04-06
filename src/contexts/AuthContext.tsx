import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
   login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("health_user");
    console.log(stored,"storedstored")
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // const login = (email: string, password: string) => {
  //   const users = JSON.parse(localStorage.getItem("health_users") || "[]");
  //   const found = users.find((u: any) => u.email === email && u.password === password);
  //   if (found) {
  //     const userData = { name: found.name, email: found.email };
  //     setUser(userData);
  //     localStorage.setItem("health_user", JSON.stringify(userData));
  //     return true;
  //   }
  //   return false;
  // };
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("https://health-back-end.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        return { success: false };
      }
  
      const userData = { name:data.name, email:data.email }; 
      setUser(userData);
      localStorage.setItem("health_user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
  
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  // const signup = (name: string, email: string, password: string) => {
  //   const users = JSON.parse(localStorage.getItem("health_users") || "[]");
  //   if (users.find((u: any) => u.email === email)) return false;
  //   users.push({ name, email, password });
  //   localStorage.setItem("health_users", JSON.stringify(users));
  //   // Auto-login on first signup
  //   const userData = { name, email };
  //   setUser(userData);
  //   localStorage.setItem("health_user", JSON.stringify(userData));
  //   return true;
  // };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("https://health-back-end.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // auto login after signup
         const loginresult = await login(email, password);
         return loginresult;
      }
      return { success: false };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("health_user");
  // };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("health_user");
    localStorage.removeItem("token"); // important
    localStorage.removeItem("health_history");

  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
