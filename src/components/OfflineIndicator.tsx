import { Wifi, WifiOff, RefreshCw, CloudOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function OfflineIndicator() {
  const { online, syncing, pendingCount, syncPending } = useOfflineSync();

  if (online && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {!online && (
        <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1.5 text-sm shadow-lg">
          <WifiOff className="h-3.5 w-3.5" />
          Offline Mode
        </Badge>
      )}
      {pendingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={online ? "default" : "secondary"}
              className="shadow-lg gap-1.5"
              onClick={syncPending}
              disabled={!online || syncing}
            >
              {syncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CloudOff className="h-3.5 w-3.5" />
              )}
              {pendingCount} pending
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {online ? "Click to sync offline changes" : "Changes will sync when you're back online"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
