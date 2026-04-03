import { useState, useEffect } from "react";
import { Download, Smartphone, Wifi, WifiOff, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnlineStatus } from "@/hooks/useOfflineSync";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  const steps = [
    { icon: Smartphone, title: "Install the App", desc: "Add InvenTrack to your home screen for instant access" },
    { icon: Wifi, title: "Works Offline", desc: "Browse inventory and make changes without internet" },
    { icon: CheckCircle2, title: "Auto Sync", desc: "Changes sync automatically when you're back online" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Install InvenTrack</h1>
          <p className="text-muted-foreground">
            Get the full app experience — works even without internet.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            {online ? (
              <span className="flex items-center gap-1 text-green-600"><Wifi className="h-4 w-4" /> Online</span>
            ) : (
              <span className="flex items-center gap-1 text-destructive"><WifiOff className="h-4 w-4" /> Offline</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {installed ? (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-foreground">InvenTrack is installed!</p>
                <p className="text-sm text-muted-foreground">Open it from your home screen.</p>
              </div>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button size="lg" className="w-full gap-2" onClick={handleInstall}>
            <Download className="h-5 w-5" /> Install InvenTrack
          </Button>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Manual Installation</CardTitle>
              <CardDescription>
                Use your browser menu to install:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <strong>iPhone/iPad:</strong> Tap Share → Add to Home Screen
              </p>
              <p className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <strong>Android:</strong> Tap ⋮ menu → Install app
              </p>
              <p className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <strong>Desktop:</strong> Click the install icon in the address bar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
