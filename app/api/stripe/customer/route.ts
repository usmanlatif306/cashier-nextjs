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
    const { line1, city, state, postal_code, country } = await request.json();

    // get user record to from db
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return {
        error: "Not authenticated",
      };
    }
    let customer = null;
    let actionType = "";
    let paymentMethodId = "pm_card_visa"; // this is testing payment method for test. in live you are already saving the user payment methods.

    // if stripe customer is not create on stripe, then create
    if (!user.stripe_customer_id) {
      // creating stripe customer
      customer = await stripe.customers.create({
        name: user.name,
        email: user.email,
        address: {
          line1: line1,
          city: city,
          state: state,
          postal_code: postal_code,
          country: country,
        },
      });
      actionType = "Created";
    } else {
      // stripe customer is already created on stripe, update address value
      customer = await stripe.customers.update(user.stripe_customer_id, {
        address: {
          line1: line1,
          city: city,
          state: state,
          postal_code: postal_code,
          country: country,
        },
      });
      actionType = "Updated";
    }

    // updating stripe customer details to db
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripe_customer_id: customer.id,
        line1: line1,
        city: city,
        state: state,
        postal_code: postal_code,
        country: country,
        stripe_payment_method_id: paymentMethodId,
      },
    });

    // revalidate cache to get latest user data
    await revalidateTag(`user-${userId}`);

    return Response.json(
      {
        success: true,
        message: `Stripe Customer ${actionType} Successfully!`,
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
