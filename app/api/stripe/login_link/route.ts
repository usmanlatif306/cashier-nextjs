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
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id as string
    );

    return Response.json(
      {
        success: true,
        message: `Retrieve the URL from the response and redirect the user to Stripe.`,
        link: loginLink.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message: "Failed to create a Stripe login link.",
      },
      { status: 500 }
    );
  }
}
