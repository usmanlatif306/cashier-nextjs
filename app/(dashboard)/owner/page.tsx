import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import prisma from "@/lib/prisma";
import StripeCustomerForm from "@/components/stripe-customer-form";
import AddBank from "@/components/owner/add-bank";
import Stripe from "stripe";
import PaymentLinks from "@/components/owner/payment-links";

const Dashboard = async ({ searchParams }: { searchParams: any }) => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const tab = searchParams?.tab ?? "customer";
  const error = searchParams?.tab ?? false;
  let errorMessage = "";
  if (error && searchParams?.message) {
    errorMessage = searchParams.message;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  let stripeObject = {};

  // get connected accounts balance information
  // this can only done in server side. As this component is server component that's why I am getting here. If I had to fetch these in <AddBank> component which is client component then I have to use api
  if (user && user.completed_onboarding) {
    // only intilaize stripe when user has completed onboarding process
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id as string,
    });

    stripeObject = Object.assign(stripeObject, {
      balanceAvailable: balance.available[0].amount,
      balancePending: balance.pending[0].amount,
    });
  }

  return (
    <Tabs defaultValue={tab} className="">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="customer" className="flex gap-3">
          Stripe Customer
          {/* @ts-ignore */}
          {user?.stripe_customer_id && (
            <Check width={22} className="text-green-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="bank" className="flex gap-3">
          Add Bank Account
          {user?.completed_onboarding && (
            <Check width={22} className="text-green-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="payment_links" className="flex gap-3">
          Generate Payment Links
        </TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <StripeCustomerForm user={user} />
      </TabsContent>
      <TabsContent value="bank">
        <AddBank
          user={user}
          errorMessage={errorMessage}
          stripeObject={stripeObject}
        />
      </TabsContent>
      <TabsContent value="payment_links">
        <PaymentLinks user={user} />
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
