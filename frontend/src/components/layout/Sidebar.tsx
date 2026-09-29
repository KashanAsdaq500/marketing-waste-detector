"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  History,
  Bot,
  Settings,
  Info,
  LogOut,
  Zap,
  TrendingDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analyze CSV", href: "/analyze", icon: UploadCloud },
    { label: "Campaigns", href: "/campaigns", icon: Layers },
    { label: "History", href: "/history", icon: History },
    { label: "AI Assistant", href: "/assistant", icon: Bot, badge: "RAG" },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "About", href: "/about", icon: Info },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight leading-none">
              CampaignPulse
            </h1>
            <span className="text-[10px] text-cyan-400 font-medium tracking-wide uppercase mt-1 block">
              Waste Intelligence AI
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-white font-semibold border-l-2 border-indigo-400 pl-[10px]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-400" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-900/80 border border-indigo-700/60 flex items-center justify-center text-xs font-bold text-indigo-200">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {user?.fullName || "Analyst"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || "offline-mode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
