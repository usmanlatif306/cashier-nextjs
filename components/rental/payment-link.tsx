"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PaymentIntents } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PaymentLink = ({ paymentLink }: { paymentLink: PaymentIntents }) => {
  const router = useRouter();

  // refirect user to stripe checkout for payment
  function handlePay() {
    router.replace(paymentLink.link as string);
  }

  return (
    <TableRow>
      <TableCell>{paymentLink.intentId}</TableCell>
      <TableCell>${paymentLink.amount}</TableCell>
      <TableCell>${paymentLink.shippingAmount}</TableCell>
      <TableCell>{paymentLink.isPaid ? "Yes" : "No"}</TableCell>
      <TableCell>
        {!paymentLink.isPaid ? (
          <Button type="submit" variant="outline" onClick={handlePay}>
            Pay
          </Button>
        ) : (
          <Button type="submit" variant="outline" disabled>
            Paid
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default PaymentLink;
