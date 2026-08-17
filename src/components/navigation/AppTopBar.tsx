import { motion } from "framer-motion";
import { Search, Activity, Cpu, Bell, Shield, User } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { MODULES } from "@/app/config/modules";
import { Logo } from "@/components/common/Logo";
import { NotificationsMenu } from "./NotificationsMenu";
import { SystemStatusMenu } from "./SystemStatusMenu";
import { UserMenu } from "./UserMenu";
import { useSystemStatus } from "@/hooks/use-forge-store";

export function AppTopBar({ onSearch }: { onSearch: () => void }) {
  const location = useLocation();
  const system = useSystemStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#060913]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* Top Ambient Laser Edge */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-3 px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <NavLink
          to="/command-center"
          className="group flex shrink-0 items-center gap-2 text-slate-100 transition-all hover:scale-105"
          aria-label="UNIFORGE — Command Center"
        >
          <Logo markClassName="text-cyan-400 drop-shadow-[0_0_10px_rgba(55,199,234,0.6)]" />
        </NavLink>

        {/* System Telemetry Status Pill */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 uf-mono text-[10px] text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold tracking-widest uppercase">PIPELINE ONLINE</span>
        </div>

        {/* Primary Navigation Bar */}
        <nav
          className="ml-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none"
          aria-label="Primary modules"
        >
          {MODULES.map((m) => {
            const isActive = location.pathname === m.path;
            return (
              <NavLink
                key={m.id}
                to={m.path}
                className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 uf-mono text-[11px] font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "text-cyan-300 font-black"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-topbar-pill"
                    className="absolute inset-0 rounded-lg border border-cyan-500/40 bg-cyan-500/15 shadow-[0_0_15px_rgba(55,199,234,0.2)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Quick Search Command Palette Trigger */}
          <button
            type="button"
            onClick={onSearch}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-800 bg-[#0a0e1a] px-3 uf-mono text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:text-slate-100 hover:shadow-[0_0_12px_rgba(55,199,234,0.15)]"
            aria-label="Search products, sources and conflicts"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Search Matrix</span>
            <kbd className="hidden md:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          <NotificationsMenu />
          <SystemStatusMenu />
          <UserMenu />
        </div>
      </div>

      {/* Bottom Glowing Laser Underline */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
    </header>
  );
}
