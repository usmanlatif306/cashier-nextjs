"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RentalProps {
  id: string;
  name: string;
  email: string;
}

const formSchema = z.object({
  rentalId: z.string().min(2).max(50),
  amount: z.string().min(2).max(50),
  shippingAmount: z.string().min(2).max(50),
});

const AddPaymentLink = ({ rentals }: { rentals: RentalProps[] }) => {
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rentalId: "",
      amount: "",
      shippingAmount: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await fetch("/api/stripe/payment_intents", {
      method: "POST",
      body: JSON.stringify({
        ...values,
      }),
    })
      .then((res) => res.json())
      .then((res: any) => {
        if (res.success) {
          form.reset();
          router.refresh();
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      })
      .catch((error: any) => toast.error(error.message));
  }

  return (
    <>
      <h3 className="text-xl font-semibold mb-3">Add Payment Link</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-5">
            <FormField
              control={form.control}
              name="rentalId"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Rental</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Rental" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rentals.map((rental) => (
                        <SelectItem key={rental.id} value={rental.id}>
                          {rental.name} ({rental.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-5 z-50">
            <FormField
              control={form.control}
              name="shippingAmount"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Shipping Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Shipping Amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" className="mt-7">
              Generate Payment Link
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default AddPaymentLink;
