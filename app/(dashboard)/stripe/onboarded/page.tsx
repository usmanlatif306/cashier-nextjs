import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const StripeOnBoarded = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  if (!user) {
    redirect("/");
  }

  let account = null;

  try {
    // Retrieve the user's Stripe account and check if they have finished onboarding
    account = await stripe.accounts.retrieve(user.stripe_account_id as string);
  } catch (error: any) {
    // unable to find user record through account id from stripe
    redirect(
      `/${user.role}?tab=bank&error=true&message=${encodeURI(
        "Failed to retrieve Stripe account information."
      )}`
    );
  }

  // User has successfully completed onboarding and connected bank account, update user record in databse
  if (account.details_submitted) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        completed_onboarding: true,
      },
    });

    // redirect user to desire route
    redirect(`/${user.role}?tab=bank`);
  } else {
    // user has not complete onboarding process, show error message
    redirect(`/${user.role}?tab=bank&error=true`);
  }

  return;
};

export default StripeOnBoarded;
