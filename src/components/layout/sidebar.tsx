"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Settings, ChevronDown, FolderOpen, BookOpen, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND_RED = "#FC4C48";

interface Project {
  id: string;
  name: string;
  status: string;
  imageUrl: string | null;
  logoUrl: string | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data))
      .catch(() => {});
  }, []);

  const isProjectsActive = pathname === "/" || pathname.startsWith("/projects");
  const isTasksActive = pathname.startsWith("/tasks");
  const isAdminActive = pathname.startsWith("/admin-tasks");
  const isResourcesActive = pathname.startsWith("/resources");
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <aside className="w-[260px] border-r border-border/50 bg-sidebar backdrop-blur-xl flex flex-col">
      <div className="px-6 pt-8 pb-6 flex items-center gap-2.5">
        <img src="/icon.svg" alt="WenLaunch" className="h-7 w-7 rounded-lg" />
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground/90">
          WenLaunch Hub
        </h1>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {/* Projects with dropdown */}
        <div>
          <div className="flex items-center">
            <Link
              href="/"
              className={cn(
                "flex-1 flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
                isProjectsActive
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-[16px] w-[16px]" style={{ color: BRAND_RED }} />
              Projects
            </Link>
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent/60 transition-all"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  !projectsOpen && "-rotate-90"
                )}
              />
            </button>
          </div>
          {projectsOpen && projects.length > 0 && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
              {projects.map((project) => {
                const isActive = pathname === `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[12px] font-medium transition-all duration-150 truncate",
                      isActive
                        ? "bg-accent/80 text-foreground"
                        : "text-muted-foreground/70 hover:bg-accent/40 hover:text-foreground"
                    )}
                  >
                    {project.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt=""
                        className="h-4 w-4 rounded object-contain shrink-0"
                      />
                    ) : project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt=""
                        className="h-4 w-4 rounded object-cover shrink-0"
                      />
                    ) : (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* All Tasks */}
        <Link
          href="/tasks"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
            isTasksActive
              ? "bg-accent text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <CheckSquare className="h-[16px] w-[16px]" style={{ color: BRAND_RED }} />
          All Tasks
        </Link>

        {/* Admin Tasks */}
        <Link
          href="/admin-tasks"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
            isAdminActive
              ? "bg-accent text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <ClipboardList className="h-[16px] w-[16px]" style={{ color: BRAND_RED }} />
          Admin Tasks
        </Link>

        {/* Resources */}
        <Link
          href="/resources"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
            isResourcesActive
              ? "bg-accent text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <BookOpen className="h-[16px] w-[16px]" style={{ color: BRAND_RED }} />
          Resources
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-150",
            isSettingsActive
              ? "bg-accent text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <Settings className="h-[16px] w-[16px]" style={{ color: BRAND_RED }} />
          Settings
        </Link>
      </nav>
      <div className="px-4 py-4 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground/60 font-medium">
          v1.0
        </p>
      </div>
    </aside>
  );
}
