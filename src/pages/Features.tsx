import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tag, Radio, Search, AlertTriangle, MapPinOff, LogIn, MapPin,
  WifiOff, Shield, Settings, ArrowLeft, Box,
} from "lucide-react";

const features = [
  {
    icon: Tag,
    title: "Tagging Items",
    desc: "Issue unique tags to items for precise identification. Every item gets a unique ID that makes tracking effortless across your entire operation.",
  },
  {
    icon: Radio,
    title: "Real Time Inventory",
    desc: "The key feature of InvenTrack — inventory updates in real time with respective locations. Locations can be user-defined or GPS-based depending on your licence.",
  },
  {
    icon: Search,
    title: "Search an Item",
    desc: "Search any item by ID or name instantly. To reduce turnaround time, results show the last-seen location so you know exactly where to look.",
  },
  {
    icon: AlertTriangle,
    title: "Missing Items",
    desc: "View a consolidated list of all missing items detected during the last inventory cycle. Stay on top of discrepancies before they become losses.",
  },
  {
    icon: MapPinOff,
    title: "Mislocated Items",
    desc: "Identifies items shifted from their assigned location. See where an item belongs and where it currently is — fix misplacements instantly.",
  },
  {
    icon: LogIn,
    title: "Check In / Check Out",
    desc: "Check out authorises an item to leave premises and excludes it from inventory. Check in brings it back into active tracking.",
  },
  {
    icon: MapPin,
    title: "Geolocation",
    desc: "RFID and GPS-based inventory module that tracks asset geo-location. Each inventory cycle reveals the movement status of every tagged asset.",
  },
  {
    icon: WifiOff,
    title: "Online / Offline Mode",
    desc: "Conduct inventory whether or not a network is available. Data syncs automatically once connectivity is restored — no work is ever lost.",
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Role-based security restricts users to modules relevant to their assigned role. Admins control all role assignments and permissions.",
  },
  {
    icon: Settings,
    title: "Scope of Customization",
    desc: "Engineered by Netpaze Solutions to adapt to any business process. Custom workflows, fields, and integrations can be implemented with ease.",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Box className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Inven<span className="text-primary">Track</span> Features
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A comprehensive suite of capabilities designed to give you complete control over your inventory and assets.
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/50 py-12 text-center">
        <h2 className="text-xl font-bold text-foreground">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">Sign up now and take control of your inventory.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} InvenTrack by Netpaze Solutions.
      </footer>
    </div>
  );
}
