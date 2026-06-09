"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess("A password reset link has been sent to your email address.");
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 p-10 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-sky-500 shadow-lg shadow-purple-500/20 mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h2>
          <p className="mt-3 text-center text-sm text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
            <span className="text-red-500">⚠</span> {error}
          </div>
        )}

        {/* Success Message */}
        {success ? (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-4 rounded-xl flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
            
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-700/50 rounded-xl shadow-sm bg-slate-800/50 text-sm font-bold text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetSubmit}>
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full border border-slate-700/50 bg-slate-800/50 placeholder-slate-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all sm:text-sm"
                style={{ paddingLeft: "2.5rem", paddingRight: "0.75rem", paddingTop: "0.875rem", paddingBottom: "0.875rem" }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-900 bg-sky-400 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]"
              >
                {loading ? (
                  "Sending link..."
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link <Sparkles className="w-4 h-4" />
                  </span>
                )}
              </button>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-700/50 rounded-xl shadow-sm bg-slate-800/50 text-sm font-bold text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </Link>
            </div>
          </form>
        )}

        <div className="text-center mt-6 pt-4 border-t border-slate-700/30">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
