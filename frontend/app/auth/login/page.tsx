"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User, CheckCircle, Sparkles, Users } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      // Login request
      try {
        const response = await fetch('http://localhost:8000/api/users/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Login successful:", data);

          // Store user data and token
          if (data.token) {
            localStorage.setItem('authToken', data.token); // Store the JWT token
          }
          if (data.user) {
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userFullName', data.user.full_name);
          }

          // Show success message
          alert("Login successful! Redirecting to dashboard...");

          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.error("Login failed:", data);
          setError(data.message || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Registration request
      try {
        // Validate before sending
        if (!fullName || !email || !password || !confirmPassword) {
          setError("All fields are required");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        if (!agreeToTerms) {
          setError("You must agree to the Terms and Conditions");
          setLoading(false);
          return;
        }

        // Create payload
        const payload = {
          full_name: String(fullName),
          email: String(email),
          password: String(password),
          confirm_password: String(confirmPassword),
        };

        console.log("Sending registration payload:", payload);

        const response = await fetch('http://localhost:8000/api/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Registration response:", data);

        if (response.ok) {
          console.log("Registration successful:", data);

          // Clear form
          setFullName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setAgreeToTerms(false);

          // Show success message
          alert("Registration successful! Please login with your credentials.");

          // Switch to login mode
          setIsLogin(true);
        } else {
          console.error("Registration failed:", data);
          setError(data.message || JSON.stringify(data.errors) || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl max-w-5xl w-full flex overflow-hidden">
        {/* Left Section with Background Image */}
        <div className="w-1/2 p-12 flex flex-col justify-between relative bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/taskmango/backgroundlogin.jpg')" }}
          ></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/taskmango/taskmango.png"
                alt="Task Mango Logo"
                className="w-16 h-16"
              />
              <h2 className="text-4xl font-bold">Task Mango</h2>
            </div>
            <p className="text-lg text-green-50 mb-8">
              {isLogin
                ? "Organize tasks, collaborate with your team, and get things done with a fresh, friendly workflow."
                : "Join thousands of productive teams. Create your account and start organizing your tasks today!"}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-yellow-300" />
                <span className="font-medium">Priority Boards</span>
              </div>
              <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                <span className="font-medium">Smart Reminders</span>
              </div>
              <div className="flex items-center gap-3 bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                <Users className="w-6 h-6 text-yellow-300" />
                <span className="font-medium">Team Collaboration</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <img
              src="/taskmango/backgroundlogin.jpg"
              alt="Task Management"
              className="w-full h-48 object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Right Section (Login/Register Form) */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-100 p-3 rounded-xl">
              {isLogin ? (
                <Lock className="w-6 h-6 text-gray-800" />
              ) : (
                <UserPlus className="w-6 h-6 text-gray-800" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h2>
              <p className="text-sm text-gray-500">
                {isLogin ? "Start tracking tasks in seconds" : "Get started in just a few clicks"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot Password?
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  required={!isLogin}
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                    Terms and Conditions
                  </button>
                </label>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{isLogin ? "Signing in..." : "Creating Account..."}</span>
                  </>
                ) : isLogin ? (
                  <>
                    <LogIn size={20} />
                    <span>Login</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                {isLogin ? (
                  <>
                    New to Task Mango?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                      }}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                      }}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
