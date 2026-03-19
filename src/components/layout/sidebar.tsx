"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Projects", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] border-r border-border/50 bg-sidebar backdrop-blur-xl flex flex-col">
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground/90">
          WenLaunch Hub
        </h1>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/projects")
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-[16px] w-[16px] opacity-70" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground/60 font-medium">
          v1.0
        </p>
      </div>
    </aside>
  );
}
