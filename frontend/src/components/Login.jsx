import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn as LogInIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";
import { login } from "../services/api";
import { HiKey } from "react-icons/hi2"; // Replaced MdKey with HiKey for consistency

// Helper function to decode JWT and store user data
const decodeAndStoreUserData = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);

    if (decoded) {
      localStorage.setItem("EmployeeId", decoded.EmployeeId || "");
      localStorage.setItem("Username", decoded.Username || "");
      localStorage.setItem("BdCode", decoded.BdCode || "");
      localStorage.setItem("Designation", decoded.Designation || "");
      localStorage.setItem("Role", decoded.Role || "");
    }
    return true;
  } catch (error) {
    console.error("Token decoding or storage error:", error);
    return false;
  }
};

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ employeeId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Renaming 'error' to 'apiError' for clarity
  const [apiError, setApiError] = useState(null); 
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!formData.password.trim()) errors.password = "Password is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await login({
        employeeId: formData.employeeId.trim(),
        password: formData.password.trim(),
      });

      if (res && res.token) {
        localStorage.setItem("authToken", res.token);
        
        const isUserDataStored = decodeAndStoreUserData(res.token);

        if (isUserDataStored) {
            setSuccess(true);
            setTimeout(() => onLoginSuccess(), 800);
        } else {
            throw new Error("Login failed due to critical token processing error.");
        }

      } else {
        throw new Error(res?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      let errorMessage = err.message || "Login failed. Please try again.";

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("invalid credentials")
      ) {
        errorMessage = "Invalid Employee ID or Password. Please check your credentials.";
      }
      
      setApiError(errorMessage);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
      <div className="w-full bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* LEFT SIDE */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 p-12 flex flex-col justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative z-10 text-center lg:text-left">
              <div className="inline-flex items-center justify-center mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                  {/* Using HiKey for the logo icon */}
                  <HiKey className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                Welcome Back!
              </h1>
              <p className="text-blue-100 text-base sm:text-lg mb-10 sm:mb-12">
                Sign in to access your Business Development Dashboard
              </p>

              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Secure Access</h3>
                    <p className="text-blue-100 text-sm">
                      Your data is protected with enterprise-grade security
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
                    <p className="text-blue-100 text-sm">
                      Track performance metrics and insights instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/20 flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Fast & Reliable</h3>
                    <p className="text-blue-100 text-sm">
                      Lightning-fast performance for seamless workflow
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
                <p className="text-blue-100 text-xs sm:text-sm">
                  © 2025 EFRAC. All rights reserved.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User
                        className={`w-5 h-5 ${
                          validationErrors.employeeId ? "text-red-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.employeeId
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter your employee ID"
                    />
                  </div>
                  {validationErrors.employeeId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.employeeId}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        className={`w-5 h-5 ${
                          validationErrors.password ? "text-red-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{apiError}</p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600">Login successful! Redirecting...</p>
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <LogInIcon className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Having trouble signing in?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Contact Support
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;