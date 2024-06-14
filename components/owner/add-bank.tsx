"use client";

import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AddBank = ({
  user,
  errorMessage,
  stripeObject,
}: {
  user: any;
  errorMessage: string;
  stripeObject: {
    balanceAvailable?: number;
    balancePending?: number;
  };
}) => {
  const [connected] = useState(user.completed_onboarding);
  const [error, setError] = useState(errorMessage);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // handeling verifying button click
  async function handleAddBankClick() {
    // set loading to true to disable the add bank account button
    setLoading(true);

    // remove error message to hide the error message
    setError("");

    // Call your backend to create the Verification Session.
    await fetch("/api/stripe/authorize", {
      method: "POST",
    })
      .then((res) => res.json())
      .then(async (session: any) => {
        // an error occurred while creating the authorize onboarding link
        if (!session.success) {
          toast.error(session.message);
        } else {
          toast.success(session.message);
          // authorize onboarding link is successfully created, Now redirect user to that link.
          router.replace(session.link as string);
        }
      })
      .catch((error: any) => toast.error(error.message));
  }

  // Generate a unique login link for the associated Stripe account to access their Express dashboard
  async function generateLoginLink() {
    // set loading to true to disable the button
    setLoading(true);

    // Call your backend to create the Verification Session.
    await fetch("/api/stripe/login_link", {
      method: "POST",
    })
      .then((res) => res.json())
      .then(async (session: any) => {
        // an error occurred while creating the authorize onboarding link
        if (!session.success) {
          toast.error(session.message);
        } else {
          toast.success(session.message);
          // Retrieve the URL from the response and redirect the user to Stripe
          router.replace(session.link as string);
        }
      })
      .catch((error: any) => toast.error(error.message));

    // set loading to false to enable the button
    setLoading(false);
  }

  async function handlePayout() {
    // set loading to true to disable the button
    setLoading(true);

    // Creating payouts on backend.
    await fetch("/api/stripe/payouts", {
      method: "POST",
    })
      .then((res) => res.json())
      .then(async (session: any) => {
        // an error occurred while creating payouts
        if (!session.success) {
          toast.error(session.message);
        } else {
          // Successfully created payouts
          toast.success(session.message);
        }
      })
      .catch((error: any) => toast.error(error.message));

    // set loading to false to enable the button
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      {/* user has completed onboarding process */}
      {connected && !error && (
        <>
          <CircleCheck width={40} height={40} className="text-green-500" />
          <h3 className="font-semibold text-lg mt-3">
            Congratulations! You are successfully attached bank account with
            Stripe
          </h3>

          {/* login link for the associated Stripe account */}
          <div className="mt-3">
            <Button
              type="submit"
              variant="outline"
              className="mt-3"
              onClick={generateLoginLink}
              disabled={loading}
            >
              Login to Stripe Account
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-8">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Available Balance: </h4>
              <h4 className="text-lg font-semibold">
                ${stripeObject?.balanceAvailable}
              </h4>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Pending Balance: </h4>
              <h4 className="text-lg font-semibold">
                ${stripeObject?.balancePending}
              </h4>
            </div>
          </div>

          {/* payout availabale balance to bank account */}
          <div className="my-3">
            <Button
              type="submit"
              variant="outline"
              className="mt-3"
              onClick={handlePayout}
              disabled={loading}
            >
              Payout Available Balance
            </Button>
          </div>
        </>
      )}

      {/* show error like if user cancelled onboaring(connecting bank account) process */}
      {error && (
        <>
          <CircleX width={40} height={40} className="text-red-500" />
          <h3 className="font-semibold text-lg my-3">
            Opps! An error happened
          </h3>
          <p className="text-base">{error}</p>
        </>
      )}

      {/* user has not connected bank account, show button */}
      {!connected && (
        <Button
          type="submit"
          variant="outline"
          className="mt-3"
          onClick={handleAddBankClick}
          disabled={loading}
        >
          Connect Your Bank Account
        </Button>
      )}
    </div>
  );
};

export default AddBank;
