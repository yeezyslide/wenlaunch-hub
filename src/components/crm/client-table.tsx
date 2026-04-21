"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CLIENT_STATUS_COLORS, CLIENT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ClientForm } from "./client-form";
import { Search, ExternalLink, Mail } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  role: string | null;
  status: string;
  referralSource: string | null;
  budgetRange: string | null;
  projectInterest: string;
  description: string | null;
  notes: string | null;
  tags: string;
  createdAt: Date | string;
  _count: { deals: number; projects: number };
  deals: { value: number; stage: string }[];
}

export function ClientTable({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = clients.filter((c) => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search name, company, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setStatusFilter("All")}
            className={cn(
              "text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
              statusFilter === "All"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {CLIENT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Deals</TableHead>
            <TableHead className="text-right">Pipeline</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((client) => {
            const interests = client.projectInterest
              ? client.projectInterest.split(",").filter(Boolean)
              : [];
            const pipeline = client.deals
              .filter((d) => d.stage !== "Lost")
              .reduce((s, d) => s + d.value, 0);

            return (
              <TableRow key={client.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/15 to-violet-500/15 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-semibold text-muted-foreground/60">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate">
                        {client.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                        {client.company && <span className="truncate">{client.company}</span>}
                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="hover:text-foreground flex items-center gap-0.5"
                          >
                            <Mail className="h-2.5 w-2.5" />
                            {client.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-medium rounded-full px-2 py-0",
                      CLIENT_STATUS_COLORS[client.status]
                    )}
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {interests.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {interests.slice(0, 2).map((i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
                        >
                          {i}
                        </span>
                      ))}
                      {interests.length > 2 && (
                        <span className="text-[10px] text-muted-foreground/50">
                          +{interests.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/30 text-[12px]">—</span>
                  )}
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground/70">
                  {client.referralSource || <span className="text-muted-foreground/30">—</span>}
                </TableCell>
                <TableCell className="text-[12px] text-muted-foreground/70">
                  {client.budgetRange || <span className="text-muted-foreground/30">—</span>}
                </TableCell>
                <TableCell className="text-right text-[12px] font-medium text-muted-foreground/60">
                  {client._count.deals}
                </TableCell>
                <TableCell className="text-right">
                  {pipeline > 0 ? (
                    <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ${pipeline.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground/30">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {client.website && (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground/60 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <ClientForm
                      client={client}
                      trigger={
                        <button className="h-7 px-2 rounded-md hover:bg-accent text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          Edit
                        </button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-[13px] text-muted-foreground/50">
          No clients match your filters.
        </div>
      )}
    </div>
  );
}
