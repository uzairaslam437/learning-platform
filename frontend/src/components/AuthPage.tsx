import React, { useState } from "react";
import { Eye, EyeOff, User, GraduationCap, BookOpen } from "lucide-react";
import { useAuth } from "../hooks/Auth";
import type { AppPage } from "../types/Auth";

interface AuthPageProps {
  onNavigate: (page: AppPage) => void;
  params?: any;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, params }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "instructor">(
    params?.role || "student"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let res;

      if (isLogin) {
        res = await login(formData.email, formData.password, role);
        console.log("AuthPage login response:", res);
      } else {
        res = await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          role
        );
        console.log("AuthPage register response:", res);
      }

      // Handle response
      if (res?.error) {
        setErrorMessage(res.error);
        setSuccessMessage("");
      } else if (res?.success) {
        setSuccessMessage(
          res?.message || `${isLogin ? "Login" : "Registration"} successful`
        );
        setErrorMessage("");

        // Add a small delay before navigation to show success message
        setTimeout(() => {
          onNavigate(
            role === "student" ? "student-dashboard" : "instructor-dashboard"
          );
        }, 1000);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } catch (err: any) {
      console.error("AuthPage error:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage("");
    setSuccessMessage("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <button
              type="button"
              onClick={() => onNavigate("landing")}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              return to home
            </button>
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {/* Role Selection */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
              role === "student"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
              role === "instructor"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="mr-2 h-4 w-4" />
            Instructor
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required={!isLogin}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required={!isLogin}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </>
            )}

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
            />

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>{isLogin ? "Sign in" : "Sign up"}</span>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};