import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

import { useAuthStore } from "@/stores/Auth/auth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/Components/Toast";
// import logo from "@/assets/logo.png";
import logo1 from "@/assets/logo1.png";

interface LoginErrors {
  username?: string;
  password?: string;
  submit?: string;
}

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const navigate = useNavigate();
  const { login, isAuthenticated, loading, error, clearError } = useAuthStore();

  // Clear any stale auth errors on component mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated and show success toast
  useEffect(() => {
    if (isAuthenticated) {
      addToast("success", "Login successful! Redirecting to dashboard...");

      // Redirect to dashboard after 1.5 seconds
      const redirectTimer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate]);

  // Show toast for auth errors (but don't reload if it's a session expiry message)
  useEffect(() => {
    if (error) {
      // Only show toast if it's not a session expired message (user is already on login page)
      if (!error.toLowerCase().includes("session expired")) {
        addToast("error", error);
      }

      // Clear the error after showing it
      const clearTimer = setTimeout(() => {
        clearError();
      }, 1000);

      return () => clearTimeout(clearTimer);
    }
  }, [error, clearError]);

  const validateForm = (): LoginErrors => {
    const newErrors: LoginErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous auth errors
    clearError();

    // Validate
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Show validation errors as toast
      const firstError = Object.values(newErrors)[0];
      if (firstError) {
        addToast("error", firstError);
      }
      return;
    }

    // Store remember me preference
    if (rememberMe) {
      localStorage.setItem("rememberUsername", username.trim());
    } else {
      localStorage.removeItem("rememberUsername");
    }

    try {
      // Use the auth store login method
      await login({ username: username.trim(), password });

      // Success toast will be shown by the useEffect watching isAuthenticated
    } catch (error: unknown) {
      // Error toast is handled by the useEffect hook watching the error state
    }
  };

  const handleInputChange = (field: keyof LoginErrors, value: string) => {
    if (field === "username") setUsername(value);
    if (field === "password") setPassword(value);

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Load remembered username on component mount and clear any session errors
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }

    // Clear any existing auth errors when login page loads
    clearError();
  }, [clearError]);

  return (
    <div className="min-h-screen relative">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1164A3]/90 via-[#1164A3]/85 to-[#1A9641]/90 sm:from-[#1164A3]/85 sm:via-[#1164A3]/80 sm:to-[#1A9641]/85"></div>

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] p-6 md:p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-25 h-25 lg:w-25 lg:h-28 flex items-center justify-center">
                <img
                  src={logo1}
                  alt="Grace International Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-25 h-25 lg:w-25 lg:h-25 flex items-center justify-center">
                {/* <img
                  src={logo}
                  alt="Grace International Logo"
                  className="w-full h-full object-contain"
                /> */}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight drop-shadow-lg">
              Welcome to Your
              <br />
              Learning Journey
            </h2>
            <p className="text-white/95 text-base lg:text-lg mb-6 lg:mb-8 drop-shadow">
              Access your courses, track your progress, and achieve your
              educational goals.
            </p>

            {/* Features */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base">
                    Interactive Learning
                  </h3>
                  <p className="text-white/90 text-xs lg:text-sm">
                    Engage with comprehensive course materials and video lessons
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base">
                    Track Progress
                  </h3>
                  <p className="text-white/90 text-xs lg:text-sm">
                    Monitor your learning journey and achievements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-white/20 hover:bg-white/15 transition-all">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/30">
                  <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-0.5 lg:mb-1 text-sm lg:text-base">
                    Expert Instruction
                  </h3>
                  <p className="text-white/90 text-xs lg:text-sm">
                    Learn from qualified teachers and comprehensive resources
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-white/90 text-xs lg:text-sm drop-shadow">
            © 2024 Grace International. All rights reserved.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-[55%] flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center gap-3 mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-sm  rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50 p-3">
                {/* <img
                  src={logo}
                  alt="Grace International Logo"
                  className="w-full h-full object-contain"
                /> */}
              </div>
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                  Grace International
                </h1>
                <p className="text-white/95 text-xs sm:text-sm font-medium drop-shadow">
                  Learning Management System
                </p>
              </div>
            </div>

            {/* Form Box */}
            <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                Sign In
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">
                Enter your credentials to access your account
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      placeholder="Enter your username"
                      disabled={loading}
                      autoComplete="username"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#1164A3] ${
                        errors.username
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white focus:border-[#1164A3]"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={loading}
                      autoComplete="current-password"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-[#1164A3] ${
                        errors.password
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-white focus:border-[#1164A3]"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#1164A3] transition disabled:opacity-60 p-1"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-gray-300 text-[#1164A3] focus:ring-[#1164A3] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-xs sm:text-sm text-gray-600 cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      /* Add forgot password logic */
                    }}
                    className="text-xs sm:text-sm text-[#1164A3] hover:text-[#1A9641] font-medium transition-colors text-left xs:text-right"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gradient-to-r from-[#1164A3] to-[#1A9641] text-white cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-[#1164A3] to-[#1A9641] hover:from-[#0d5189] hover:to-[#158037] text-white shadow-md hover:shadow-lg active:scale-95 sm:transform sm:hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
                Need help? Contact{" "}
                <a
                  href="mailto:support@graceinternational.edu"
                  className="text-[#1164A3] hover:text-[#1A9641] font-medium transition-colors break-all"
                >
                  support@graceinternational.edu
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-white/90 drop-shadow px-4 lg:text-gray-500 lg:drop-shadow-none">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="text-white lg:text-[#1164A3] hover:text-white/80 lg:hover:text-[#1A9641] font-medium transition-colors underline lg:no-underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-white lg:text-[#1164A3] hover:text-white/80 lg:hover:text-[#1A9641] font-medium transition-colors underline lg:no-underline"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
