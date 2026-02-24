import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { Polar } from "@polar-sh/sdk";

import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { env } from '~/env';
import { db } from '~/server/db';
import { revalidatePath } from 'next/cache';

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "50e3c25d-016a-4733-9e78-11f65884687d",
              slug: "small",
            },
            {
              productId: "89f59bf2-de91-4dff-9163-2b35d7f61b26",
              slug: "medium",
            },
            {
              productId: "8dc1c9bd-7186-48d4-8221-f3d8063f3f8d",
              slug: "large",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            console.log("POLAR WEBHOOK: Order Paid Event Triggered");
            console.log("ORDER DETAILS:", JSON.stringify(order, null, 2));

            // Normalize order object - it might be inside a 'data' property depending on the version
            const orderObj = (order as any).data || order;
            const customer = orderObj.customer;
            const productId = orderObj.productId;

            // Try to find the local user ID
            // 1. Check externalId (set by createCustomerOnSignUp or manually)
            // 2. Check customer metadata (if set by checkout plugin)
            // 3. Fallback to matching by email (less precise but good for debugging)
            
            let userId = customer?.externalId;
            const customerEmail = customer?.email;

            console.log(`Searching for user. ExternalID: ${userId}, Email: ${customerEmail}`);

            if (!userId && customerEmail) {
                console.log("No externalId found, attempting lookup by email:", customerEmail);
                const userByEmail = await db.user.findUnique({
                    where: { email: customerEmail }
                });
                if (userByEmail) {
                    userId = userByEmail.id;
                    console.log("Found user by email match:", userId);
                }
            }

            if (!userId) {
              console.error("CRITICAL: Failed to identify local user for this order.", {
                  orderId: orderObj.id,
                  customerId: customer?.id,
                  customerEmail
              });
              return;
            }

            let creditsToAdd = 0;

            // Map product IDs to credits
            switch (productId) {
              case "50e3c25d-016a-4733-9e78-11f65884687d":
                creditsToAdd = 50;
                break;
              case "89f59bf2-de91-4dff-9163-2b35d7f61b26":
                creditsToAdd = 200;
                break;
              case "8dc1c9bd-7186-48d4-8221-f3d8063f3f8d":
                creditsToAdd = 400;
                break;
              default:
                console.warn(`Unrecognized Product ID: ${productId}`);
            }

            if (creditsToAdd > 0) {
              console.log(`Processing ${creditsToAdd} credits for user: ${userId}`);
              try {
                const user = await db.user.update({
                  where: { id: userId },
                  data: {
                    credits: {
                      increment: creditsToAdd,
                    },
                     polarCustomerId: customer.id,
                  },
                });
                console.log(`SUCCESS: Credits updated. New balance for ${user.email} is ${user.credits}`);
                
                // Force Next.js to revalidate paths where credits are displayed
                revalidatePath("/dashboard", "layout");
              } catch (e) {
                console.error("DATABASE UPDATE ERROR:", e);
              }
            } else {
                console.warn("No credits added. Check Product ID mapping or payment amount.");
            }
          },
        }),
      ],
    }),
    
  ],
});