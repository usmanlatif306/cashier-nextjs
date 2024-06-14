import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import AddPaymentLink from "./add-payment-link";

const PaymentLinks = async ({ user }: { user: any }) => {
  const paymentLinks = await prisma.paymentIntents.findMany({
    where: {
      userId: user.id,
    },
    include: {
      rental: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rentals = await prisma.user.findMany({
    where: {
      role: "rental",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return (
    <div className="mt-8">
      {/* payment link form */}
      <AddPaymentLink rentals={rentals} />

      <div className="border-b border-gray-600 py-3"></div>

      {/* payment links */}
      <h3 className="text-xl font-semibold my-3">Payment Links</h3>
      <Table>
        <TableCaption>A list of created payment links</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Rental Name</TableHead>
            <TableHead>Intent ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Shipping</TableHead>
            <TableHead>Paid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentLinks.map((paymentLink) => (
            <TableRow key={paymentLink.id}>
              <TableCell>{paymentLink.rental.name}</TableCell>
              <TableCell>{paymentLink.intentId}</TableCell>
              <TableCell>${paymentLink.amount}</TableCell>
              <TableCell>${paymentLink.shippingAmount}</TableCell>
              <TableCell>{paymentLink.isPaid ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentLinks;
