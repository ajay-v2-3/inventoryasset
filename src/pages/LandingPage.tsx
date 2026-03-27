import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Box, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Box className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">InvenTrack</h1>
          <p className="text-muted-foreground">Inventory & Asset Management System</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full h-14 text-base" size="lg">
            <Link to="/login">
              <Box className="h-5 w-5 mr-2" />
              Staff Login
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-14 text-base border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" size="lg">
            <Link to="/admin-login">
              <Shield className="h-5 w-5 mr-2" />
              Admin Login
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
