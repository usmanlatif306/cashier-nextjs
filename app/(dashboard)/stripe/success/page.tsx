import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import chalk from "chalk";

const StripeCheckoutSuccess = async ({
  searchParams,
}: {
  searchParams: any;
}) => {
  const sessionId = searchParams.session_id as string;
  // if no session id present redirect user to required page
  if (!sessionId) {
    redirect("/");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const baseUrl = process.env.BASE_URL as string;

  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const rental = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // you can also do another check of checking wheather the session_id get from url is belong to user or not. we have already save payment intent so you can get the intent by id and check wheather the session_id belongs to user or not. user can manupulate the id from url.
  const paymentIntent = await prisma.paymentIntents.findUnique({
    where: {
      intentId: sessionId,
    },
  });

  if (!paymentIntent) {
    // no payment intent found, invalid session if from user, redirect user to any page with error message
    redirect("/");
  }

  // updating rental payment method if not saved yet
  // if (!rental?.stripe_payment_method_id) {
  //   // get payents methods of rental
  //   const paymentMethods = await stripe.customers.listPaymentMethods(
  //     rental?.stripe_customer_id as string
  //   );

  //   // if array is not empty
  //   if (paymentMethods.data.length > 0) {
  //     // updating payment method
  //     await prisma.user.update({
  //       where: {
  //         id: session.user.id,
  //       },
  //       data: {
  //         stripe_payment_method_id: paymentMethods.data[0].id,
  //       },
  //     });
  //   }
  // }

  // calculating total paid amount from checkout after discounts and taxes are applied.
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  const checkoutAmount = checkout.amount_total ? checkout.amount_total : 0;
  const totalAmountPaid = checkoutAmount / 100;
  const ownerShare = totalAmountPaid - Number(paymentIntent.applicationFee); // the amount that will be transfer to owner after removing application fee (2Quip 18% share)

  // if checkout session is completed, transfer funds now
  if (checkout.status === "complete") {
    const owner = await prisma.user.findUnique({
      where: {
        id: paymentIntent.userId,
      },
    });
    const stripePaymentIntent = await stripe.paymentIntents.retrieve(
      checkout.payment_intent as string
    );
    const chargeId = stripePaymentIntent.latest_charge as string;
    const ownerAccountId = owner?.stripe_account_id as string;

    // creating transer to owner account
    // funds will be tranfer to owner as soon as this checkout session funds clear to stripe.
    // make sure ownerAccountId is not null
    const transfer = await stripe.transfers.create({
      amount: ownerShare * 100,
      currency: "usd",
      source_transaction: chargeId,
      destination: ownerAccountId,
    });

    // you can transfer funds to dilevery partner (vendor) by saving delivery person id in payment intent table when we create record as we are saving owner id and then here we are getting owner account id and transfer funds to him. we can similarly do with dilivery person if we want to transfer funds automatically to him
    // for shipping charges it can also calculate and can be transfer to vendor in the same way,
    // for now all shipping charges are also transfering to owner, for transfering separately to vendor for shipping that amount will be subtracted from this ownerShare amount.

    // update payment intent in database to paid
    await prisma.paymentIntents.update({
      where: {
        intentId: sessionId,
      },
      data: {
        amountPaid: String(totalAmountPaid),
        isPaid: true,
      },
    });

    redirect("/rental");
  } else {
    // checkout session is cancelled or rejected, redirect user with error message
    redirect("/");
  }

  return;
};

export default StripeCheckoutSuccess;
