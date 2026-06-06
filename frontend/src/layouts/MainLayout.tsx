import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Search, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/search", icon: Search, label: "New Search" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
];

export default function MainLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <header className="shrink-0 border-b border-border bg-canvas">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
              <span className="text-[11px] font-bold text-primary-foreground tracking-tight">AS</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground tracking-tight">
                ANTA Signal
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground tracking-wide">
                Lead Intelligence
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isActive
                      ? "bg-surface-card text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-content flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </main>

      <footer className="shrink-0 border-t border-border bg-surface-soft px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-content items-center justify-between">
          <p className="text-xs text-muted-foreground">ANTA Signal · Lead Intelligence</p>
          <p className="text-xs text-muted-foreground">Internal Tool</p>
        </div>
      </footer>
    </div>
  );
}
