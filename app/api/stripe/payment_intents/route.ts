import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";
import { customAlphabet } from "nanoid";
import chalk from "chalk";

export async function POST(request: Request) {
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7
  ); // 7-character random string

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
    const { rentalId, amount, shippingAmount } = await request.json();

    const rental = await prisma.user.findUnique({
      where: {
        id: rentalId,
      },
    });

    if (!rental) {
      return {
        error: "Not rental found",
      };
    }

    // calculating 2quip share amount
    const applicationFee = Number(amount) * 0.18; // 2quip 18% share. you can change accordingly
    const totalAmount =
      Number(amount) + Number(shippingAmount) + applicationFee;

    // we are using chechout session instead of payment intent because Low-code and no-code integration tax only available for checkouts, billings and invoices, see https://docs.stripe.com/tax/set-up#integrate
    // for using payment intents we have to calculate tax from api which costs $0.5 for every calculations

    const transferGroup = nanoid();
    const session = await stripe.checkout.sessions.create({
      customer: rental.stripe_customer_id as string, // ID of an existing rental for this session is creating
      line_items: [
        // A list of items the customer is purchasing.
        {
          price_data: {
            unit_amount: totalAmount * 100,
            currency: "usd",
            product_data: {
              name: "Test Payment",
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // A subset of parameters to be passed to PaymentIntent creation for Checkout Sessions in payment mode.
        setup_future_usage: "off_session",
        transfer_group: transferGroup, // A string that identifies the resulting payment as part of a group.
      },
      success_url: baseUrl + "/stripe/success?session_id={CHECKOUT_SESSION_ID}", // The URL to which Stripe should send customers when payment or setup is complete. Add the {CHECKOUT_SESSION_ID} template variable to the success_url when you create the Checkout Session. Note that this is a literal string and must be added exactly as you see it here. Do not substitute it with a Checkout Session ID—this happens automatically after your customer pays and is redirected to the success page.
      cancel_url: baseUrl + "/stripe/cencel", // If set, Checkout displays a back button and customers will be directed to this URL if they decide to cancel payment and return to your website.
      automatic_tax: {
        enabled: true, // Set to true to enable automatic taxes.
        liability: {
          // The account that’s liable for tax. If set, the business address and tax registrations required to perform the tax calculation are loaded from this account. The tax transaction is returned in the report of the connected account.
          type: "account", // Type of the account referenced in the request. available values are account, self
          account: user.stripe_account_id as string, // The connected account being referenced when type is account.
        },
      },
      mode: "payment", // The mode of the Checkout Session. available values are payment, setup and subscription
    });
    console.log(chalk.yellow(JSON.stringify(session)));

    // creating payment intent in database
    await prisma.paymentIntents.create({
      data: {
        userId: user.id,
        rental: {
          connect: {
            id: rentalId,
          },
        },
        intentId: session.id,
        link: session.url,
        amount: String(totalAmount),
        applicationFee: String(applicationFee),
        ownerShare: amount,
        shippingAmount: shippingAmount,
        transferGroup: transferGroup,
      },
    });

    return Response.json(
      {
        success: true,
        message: `Chckout session successfully created.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(chalk.red(error.message));
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
