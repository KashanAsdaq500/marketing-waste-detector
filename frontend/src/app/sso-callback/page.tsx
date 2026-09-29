"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="text-center">
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        />
        <div className="text-lg font-semibold">Signing you in...</div>
        <p className="mt-2 text-sm text-slate-400">
          Completing Google authentication
        </p>
      </div>
    </div>
  );
}
