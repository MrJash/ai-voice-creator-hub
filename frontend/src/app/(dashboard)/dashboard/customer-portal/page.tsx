
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '~/lib/auth';
import { db } from '~/server/db';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Polar } from "@polar-sh/sdk";
import { env } from '~/env';

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Get the latest user data from DB
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { polarCustomerId: true, email: true }
  });

  if (!user?.polarCustomerId) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-100 text-amber-600 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No Billing History Found</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You don't have an active billing profile yet. This portal will be available after you make your first credit purchase.
        </p>
        <Link 
          href="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  let portalUrl: string | undefined;

  try {
    console.log(`Creating Polar customer session for: ${user.polarCustomerId}`);
    const result = await polar.customerSessions.create({
      customerId: user.polarCustomerId,
    });

    portalUrl = result.customerPortalUrl;
  } catch (error) {
    console.error("Failed to create Polar portal session:", error);
    return (
      <div className="flex min-h-100 flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 text-destructive mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Portals are hitting a snag</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          We couldn't connect to Polar's billing system. Please try again in a few minutes.
        </p>
        <Link 
          href="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (portalUrl) {
    redirect(portalUrl);
  }

  return (
    <div className="flex min-h-100 items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">
          Redirecting to billing portal...
        </p>
      </div>
    </div>
  );
}
