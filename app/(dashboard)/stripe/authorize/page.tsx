import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const StripeAuthorize = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const baseUrl = process.env.BASE_URL as string;

  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  // Get user account information from db
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // Create an account link for the user's Stripe account
  const accountLink = await stripe.accountLinks.create({
    account: user?.stripe_account_id as string,
    refresh_url: baseUrl + "/stripe/authorize",
    return_url: baseUrl + "/stripe/onboarded",
    type: "account_onboarding",
  });

  redirect(accountLink.url);

  return;
};

export default StripeAuthorize;
