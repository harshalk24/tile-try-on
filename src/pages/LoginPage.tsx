import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (username === "admin" && password === "Nazaraa@123") {
        // Store authentication in sessionStorage
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("username", username);
        toast.success("Login successful!");
        navigate("/visualizer");
      } else {
        toast.error("Invalid username or password");
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFE5D4] to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/logo/Nazaraa-logo.png" 
              alt="Nazaraa Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-[#222] mb-2">Welcome Back</h1>
            <p className="text-[#222]/70">Sign in to access the visualizer</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#222] mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#222]/40" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10 h-12 border-[#E6E6E6] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#222] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#222]/40" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 h-12 border-[#E6E6E6] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white h-12 text-base font-medium rounded-full"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-[#222]/70 hover:text-[#FF6B35] transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

