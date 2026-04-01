import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Box, Shield, ArrowRight, Package, Monitor, BarChart3,
  ClipboardList, Users, CheckCircle2,
} from "lucide-react";

const features = [
  { icon: Package, title: "Inventory Tracking", desc: "Real-time stock levels, categories, and supplier management" },
  { icon: Monitor, title: "Asset Management", desc: "Track equipment, conditions, and assignments across teams" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Visual dashboards with actionable insights and trends" },
  { icon: ClipboardList, title: "Audit Trail", desc: "Complete activity logs for compliance and accountability" },
  { icon: Users, title: "Role-Based Access", desc: "Separate staff and admin portals with granular permissions" },
  { icon: CheckCircle2, title: "Cloud Synced", desc: "Data persists across devices — access from anywhere" },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/25">
            <Box className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Inven<span className="text-primary">Track</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            A modern inventory and asset management system built for teams that need clarity, control, and real-time visibility.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-base shadow-md shadow-primary/20">
              <Link to="/login">
                <Box className="h-5 w-5 mr-2" />
                Staff Login
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Link to="/admin-login">
                <Shield className="h-5 w-5 mr-2" />
                Admin Login
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">
            Everything you need to manage your operations
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
            Built for small and mid-size teams to streamline inventory, assets, and reporting.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <Link to="/features" className="text-primary hover:underline font-medium">View All Features</Link>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} InvenTrack by Netpaze Solutions.
      </footer>
    </div>
  );
}
