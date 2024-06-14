import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const userId = session.user.id;

  try {
    // Create the session.
    const verificationSession =
      await stripe.identity.verificationSessions.create({
        type: "document",
        metadata: {
          user_id: userId,
        },
      });

    // save verification session into db for our records to check how many times the user has submitted his verification document. This is optional you can skip this. If you don't want to keep this information you have not any need to create this "vrification request" table. you can remove it
    await prisma.verificationRequest.create({
      data: {
        sessionId: verificationSession.id,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return Response.json(
      {
        success: true,
        message: `Stripe verification session created`,
        client_secret: verificationSession.client_secret,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message:
          error.code === "P2002" ? "Something went wrong" : error.message,
      },
      { status: 500 }
    );
  }
}
