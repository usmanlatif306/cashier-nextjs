import { redirect } from "next/navigation";

const StripeCheckoutCancel = async () => {
  // checkout session is cancelled or rejected, redirect user with error message
  redirect("/");

  return;
};

export default StripeCheckoutCancel;
