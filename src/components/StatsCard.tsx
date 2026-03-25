import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  primary: "gradient-primary",
  success: "gradient-success",
  warning: "gradient-warning",
  danger: "gradient-danger",
};

export function StatsCard({ title, value, icon: Icon, description, variant = "primary" }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-5 flex items-start gap-4">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", variantStyles[variant])}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
