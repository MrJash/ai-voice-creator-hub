"use client";

import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

export default function CustomerPortalRedirect() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const portal = async () => {
      try {
        console.log("Initializing customer portal session...");
        const session = await authClient.getSession();
        console.log("Current session user:", session?.data?.user);

        const result = await authClient.customer.portal();
        console.log("Portal result:", result);
        
        if (result?.error) {
          console.error("Portal error callback:", result.error);
          
          if (result.error.status === 404) {
            setError("We couldn't find your customer profile. This often happens if you haven't made any purchases yet or if your profile is still being synchronized.");
          } else {
            setError(result.error.message || "An unexpected error occurred while creating your billing portal session.");
          }
          return;
        }

        // If data is returned, manually redirect if the plugin hasn't already done so
        if (result?.data?.url) {
          console.log("Redirecting to portal URL:", result.data.url);
          window.location.href = result.data.url;
        }
      } catch (err) {
        console.error("Critical error in portal redirection:", err);
        setError("Something went wrong while trying to reach the billing portal.");
      }
    };
    void portal();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Billing Portal Unavailable</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {error}
        </p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-100 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          Connecting to your billing portal...
        </p>
      </div>
    </div>
  );
}