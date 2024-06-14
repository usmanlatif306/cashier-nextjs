import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import StripeCustomerForm from "@/components/stripe-customer-form";
import { getSession } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import VerifyUser from "@/components/rental/verify-user";
import prisma from "@/lib/prisma";
import PaymentLink from "@/components/rental/payment-link";

const Dashboard = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // get rental all payments links from database
  const paymentLinks = await prisma.paymentIntents.findMany({
    where: {
      rentalId: session.user.id,
    },
  });

  return (
    <Tabs defaultValue="customer" className="">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="customer" className="flex gap-3">
          Stripe Customer
          {/* @ts-ignore */}
          {user?.stripe_customer_id && (
            <Check width={22} className="text-green-500" />
          )}
        </TabsTrigger>
        <TabsTrigger value="id_verification" className="flex gap-3">
          ID Verfication
          {user?.is_verified && <Check width={22} className="text-green-500" />}
        </TabsTrigger>
        <TabsTrigger value="payment_links" className="flex gap-3">
          Payment Links
          {/* <Check width={22} className="text-green-500" /> */}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="customer">
        <StripeCustomerForm user={user} />
      </TabsContent>
      <TabsContent value="id_verification">
        <VerifyUser user={user} />
      </TabsContent>
      <TabsContent value="payment_links">
        <h3 className="text-xl font-semibold my-3 mt-5">Payment Links</h3>
        <Table>
          <TableCaption>A list of created payment links</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Intent ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentLinks.map((paymentLink) => (
              <PaymentLink key={paymentLink.id} paymentLink={paymentLink} />
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
