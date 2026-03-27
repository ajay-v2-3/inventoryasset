import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Keyboard } from "lucide-react";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
}

export function BarcodeScanner({ open, onOpenChange, onScan }: BarcodeScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("manual");
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || mode !== "camera") return;

    let scanner: Html5Qrcode | null = null;
    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        setScanning(true);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => {
            onScan(text);
            onOpenChange(false);
          },
          () => {}
        );
      } catch {
        setMode("manual");
      }
    };

    const timeout = setTimeout(startScanner, 300);

    return () => {
      clearTimeout(timeout);
      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
      setScanning(false);
    };
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setManual("");
      setMode("manual");
    }
  }, [open]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manual.trim()) {
      onScan(manual.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode / QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant={mode === "manual" ? "default" : "outline"} size="sm" onClick={() => setMode("manual")}>
            <Keyboard className="h-4 w-4 mr-1" /> Manual
          </Button>
          <Button variant={mode === "camera" ? "default" : "outline"} size="sm" onClick={() => setMode("camera")}>
            <Camera className="h-4 w-4 mr-1" /> Camera
          </Button>
        </div>

        {mode === "camera" ? (
          <div>
            <div id="qr-reader" ref={containerRef} className="w-full rounded-lg overflow-hidden" />
            {!scanning && <p className="text-sm text-muted-foreground text-center mt-2">Starting camera...</p>}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <Input
              placeholder="Enter barcode or asset ID..."
              value={manual}
              onChange={e => setManual(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full">Look Up</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
