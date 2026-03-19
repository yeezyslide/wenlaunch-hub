import { FramerIcon, FigmaIcon, ShopifyIcon } from "@/components/icons/brand-icons";
import { TAG_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TAG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Framer Dev": FramerIcon,
  Design: FigmaIcon,
  "Shopify Dev": ShopifyIcon,
};

interface TagBadgeProps {
  tag: string;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const Icon = TAG_ICONS[tag];
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-[11px] px-2.5 py-0.5 gap-1.5";
  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        sizeClasses,
        TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {Icon && <Icon className={iconSize} />}
      {tag}
    </span>
  );
}
