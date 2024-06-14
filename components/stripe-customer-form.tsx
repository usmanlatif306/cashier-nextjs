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

const formSchema = z.object({
  line1: z.string().min(2).max(255),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  postal_code: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
});

const StripeCustomerForm = ({ user }: { user: any }) => {
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line1: user ? user.line1 : "",
      city: user ? user.city : "",
      state: user ? user.state : "",
      postal_code: user ? user.postal_code : "",
      country: user ? user.country : "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await fetch("/api/stripe/customer", {
      method: "POST",
      body: JSON.stringify({
        ...values,
      }),
    })
      .then((res) => res.json())
      .then((res: any) => {
        if (res.success) {
          router.refresh();
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      })
      .catch((error: any) => toast.error(error.message));
  }

  return (
    <div className="mt-5">
      <p className="text-lg font-semibold mb-3">Customer Address</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-5">
            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Address Line 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-5">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="WA">Washington</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                      {/* add more states here */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-5">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="w-[50%]">
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      {/* add more countries here */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" className="mt-7">
              {user.stripe_customer_id ? "Update" : "Add"} Customer Details
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StripeCustomerForm;
