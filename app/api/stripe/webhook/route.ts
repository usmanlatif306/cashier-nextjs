import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";
import chalk from "chalk";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const stripeSignature = request.headers.get("stripe-signature") as string;

  let stripeEvent;

  try {
    const body = await request.text();
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      stripeSignature,
      webhookSecret
    );
  } catch (error: any) {
    console.log("error: " + error);

    return Response.json(
      {
        success: false,
        message:
          error.code === "P2002" ? "Something went wrong" : error.message,
      },
      { status: 500 }
    );
  }

  let eventObject,
    objectId,
    userId = null;

  console.log(chalk.blue("Webhook type: " + stripeEvent.type));

  // Handle the event
  switch (stripeEvent.type) {
    // handlening identity verification succcessfull
    case "identity.verification_session.verified":
      eventObject = stripeEvent.data.object;
      objectId = eventObject.id;
      userId = eventObject.metadata.user_id;

      // update verification session in db
      await prisma.verificationRequest.update({
        where: {
          sessionId: objectId,
        },
        data: {
          is_verified: true,
        },
      });

      // update user verification result in user table
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          is_verified: true,
        },
      });

      // ... do other things like notifying the user about results

      break;

    // handlening identity verification failed
    case "identity.verification_session.requires_input":
      eventObject = stripeEvent.data.object;
      objectId = eventObject.id;
      userId = eventObject.metadata.user_id;
      const errorMessage = eventObject.last_error?.reason;

      // update verification session in db
      await prisma.verificationRequest.update({
        where: {
          sessionId: objectId,
        },
        data: {
          is_verified: false,
          error: errorMessage,
        },
      });

      // update user verification result in user table
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          is_verified: false,
          verification_error: errorMessage,
        },
      });

      // ... do other things like notifying the user about results
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  console.log(chalk.green(JSON.stringify(stripeEvent.data.object)));

  return Response.json(
    {
      success: true,
      message: `Stripe webhooks received successfully`,
    },
    { status: 200 }
  );
}
