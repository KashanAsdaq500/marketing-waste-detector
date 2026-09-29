"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useAuth as useAppAuth } from "@/context/AuthContext";
import {
  TrendingDown,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Chrome,
} from "lucide-react";

export default function LoginPage() {
  const { signIn, signInDemo } = useAppAuth();
  const { signIn: clerkSignIn } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!clerkSignIn) {
      setErrorMsg("Google sign-in is not ready yet. Please try again.");
      return;
    }

    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      await clerkSignIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to continue with Google"
      );
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = () => {
    signInDemo();
    router.push("/dashboard");
  };

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
          <p className="mt-3 text-sm text-slate-400">
            {isSignedIn ? "Taking you to your dashboard..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            CampaignPulse
          </span>
        </Link>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>

        <p className="mt-1.5 text-xs text-slate-400">
          Access your private campaign analyses and RAG marketing assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-950/80 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 text-xs font-semibold transition-colors"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] text-slate-500 uppercase">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@agency.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant 1-Click Demo Login</span>
            </button>

            <p className="mt-2 text-center text-[10px] text-slate-500">
              No registration required to explore preloaded benchmarks
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
