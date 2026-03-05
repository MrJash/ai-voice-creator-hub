import { Coins } from "lucide-react";
import { getUserCredits } from "~/actions/tts";

export default async function Credits() {
  const result = await getUserCredits();
  const credits = result.success ? result.credits : 0;
  return (
    <div className="flex items-center gap-2">
      <Coins className="h-4 w-4 text-amber-500" />
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {credits}
        </span>
        <span className="text-[11px] text-muted-foreground">
          credits
        </span>
      </div>
    </div>
  );
}