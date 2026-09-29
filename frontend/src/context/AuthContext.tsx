"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useClerk,
  useSignIn,
  useSignUp,
  useUser,
} from "@clerk/nextjs";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInDemo: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = "mwd_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded: signInLoaded, signIn: clerkSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp: clerkSignUp } = useSignUp();
  const { signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [demoUserActive, setDemoUserActive] = useState(false);

  useEffect(() => {
    if (!userLoaded) return;

    if (clerkUser) {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        "";

      const fullName =
        clerkUser.fullName ||
        clerkUser.firstName ||
        email.split("@")[0] ||
        "Marketing User";

      const profile: UserProfile = {
        id: clerkUser.id,
        email,
        fullName,
        role: "Lead Growth Analyst",
      };

      setUser(profile);
      setDemoUserActive(false);

      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }

      return;
    }

    if (!demoUserActive && typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_SESSION_KEY);

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (parsed?.id?.startsWith("demo_")) {
            setUser(parsed);
            setDemoUserActive(true);
            return;
          }

          localStorage.removeItem(LOCAL_SESSION_KEY);
        } catch {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      }

      setUser(null);
    }
  }, [userLoaded, clerkUser, demoUserActive]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    if (!signInLoaded || !clerkSignIn) {
      return { error: "Authentication is still loading. Please try again." };
    }

    if (!email || !password) {
      return { error: "Please enter your email and password." };
    }

    try {
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        return {};
      }

      return {
        error:
          "Additional verification is required to complete sign-in.",
      };
    } catch (error: any) {
      console.error("Clerk sign-in error:", error);

      return {
        error:
          error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          "Unable to sign in. Please check your email and password.",
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error?: string }> => {
    if (!signUpLoaded || !clerkSignUp) {
      return { error: "Authentication is still loading. Please try again." };
    }

    if (!email || !password) {
      return { error: "Please enter a valid email and password." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    try {
      const cleanName = fullName?.trim() || email.split("@")[0];
      const nameParts = cleanName.split(/\s+/);

      const firstName = nameParts[0] || cleanName;
      const lastName =
        nameParts.length > 1
          ? nameParts.slice(1).join(" ")
          : undefined;

      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName,
        ...(lastName ? { lastName } : {}),
      });

      if (result.status === "complete") {
        return {};
      }

      return {
        error:
          "Your account requires verification before you can continue.",
      };
    } catch (error: any) {
      console.error("Clerk sign-up error:", error);

      return {
        error:
          error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          "Unable to create your account. Please try again.",
      };
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.warn("Clerk sign-out warning:", error);
    }

    setUser(null);
    setDemoUserActive(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  };

  const signInDemo = () => {
    const demoUser: UserProfile = {
      id: "demo_growth_analyst",
      email: "demo@campaign-intelligence.ai",
      fullName: "Alex Rivera",
      role: "Director of Performance Marketing",
    };

    setUser(demoUser);
    setDemoUserActive(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        LOCAL_SESSION_KEY,
        JSON.stringify(demoUser)
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: !userLoaded,
        signIn,
        signUp,
        signOut,
        signInDemo,
        isConfigured: userLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

