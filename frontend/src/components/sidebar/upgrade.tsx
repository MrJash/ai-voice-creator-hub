"use client";

import { authClient } from "~/lib/auth-client";
import { Button } from "../ui/button";
import { Zap } from "lucide-react";

export default function Upgrade() {
  const upgrade = async () => {
    await authClient.checkout({
      products: [
        "50e3c25d-016a-4733-9e78-11f65884687d",
        "89f59bf2-de91-4dff-9163-2b35d7f61b26",
        "8dc1c9bd-7186-48d4-8221-f3d8063f3f8d",
      ],
    });
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      className="group h-7 gap-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-2.5 text-xs font-semibold text-amber-600 transition-all duration-200 hover:from-amber-500/20 hover:to-orange-500/20 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
      onClick={upgrade}
    >
      <Zap className="h-3 w-3 transition-transform duration-200 group-hover:scale-110" />
      Upgrade
    </Button>
  );
}