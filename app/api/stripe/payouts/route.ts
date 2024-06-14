import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const baseUrl = process.env.BASE_URL as string;

  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  // Get user account information from db
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return {
      error: "Not authenticated",
    };
  }

  try {
    // Fetch the account balance to determine the available funds
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id as string,
    });

    // This demo app only uses USD so we'll just use the first available balance
    const { amount, currency } = balance.available[0];

    // Create a payout
    const payout = await stripe.payouts.create(
      {
        amount: amount,
        currency: currency,
        statement_descriptor: "Test description",
      },
      { stripeAccount: user.stripe_account_id as string }
    );

    return Response.json(
      {
        success: true,
        message: `A payout of ${amount} has been created to your connected bank account`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
