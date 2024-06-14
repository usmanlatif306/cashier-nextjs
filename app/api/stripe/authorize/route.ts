import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // @ts-ignore
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
    let accountId = user.stripe_account_id;

    // Create a Stripe account for this user if one does not exist already
    if (!accountId) {
      // Define the parameters to create a new Stripe account with
      let accountParams = {
        type: "express",
        country: user.country,
        email: user.email,
        // business_type: "individual" or "company",
      };

      // Companies and invididuals require different parameters
      // please uncomment below code if you want to prefill these information. otherwise on completing onboarding process these information will be collected from owner

      // if (accountParams.business_type === "company") {
      //   accountParams = Object.assign(accountParams, {
      //     company: {
      //       name: "owner buiness name" || undefined,
      //     },
      //   });
      // } else {
      //   accountParams = Object.assign(accountParams, {
      //     individual: {
      //       first_name: user.name || undefined,
      //       last_name: user.name || undefined,
      //       email: user.email || undefined,
      //     },
      //   });
      // }

      // @ts-ignore
      const account = await stripe.accounts.create(accountParams);
      accountId = account.id;

      // update stripe account id information in db
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          stripe_account_id: accountId,
        },
      });
    }

    // Create an account link for the user's Stripe account
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: baseUrl + "/stripe/authorize", //sometime the link expire due to inactivity, provide a refresh url where new account link will be generated and user will be redirected to stripe onboarding process page
      return_url: baseUrl + "/stripe/onboarded", //the return url where user will be redirected after successfully completed onboarding process
      type: "account_onboarding",
    });

    return Response.json(
      {
        success: true,
        message: `Stripe authorize onboarding link is successfully created, Now redirecting to user to complete onboarding process.`,
        link: accountLink.url,
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
