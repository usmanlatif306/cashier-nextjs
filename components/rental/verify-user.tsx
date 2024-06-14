"use client";

import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { Stripe, loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

const VerifyUser = ({ user }: { user: any }) => {
  const [submitted, setSubmitted] = useState(user.is_submitted);
  const [verified] = useState(user.is_verified);
  const [error, setError] = useState(user.verification_error);
  const [loading, setLoading] = useState(false);

  // handeling verifying button click
  async function handleVerifyClick() {
    // set loading to true to disable the verify identity button
    setLoading(true);

    // set document submission false
    setSubmitted(false);

    // remove error message to hide the error message
    setError(null);

    // initilaize stripe from stripe promise object
    const stripe = await stripePromise;

    // Stripe.js hasn't loaded yet.
    if (!stripe) {
      return;
    }

    // Call your backend to create the Verification Session.
    await fetch("/api/stripe/verification_session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then(async (session: any) => {
        // an error occurred while creating the Verification Session
        if (!session.success) {
          toast.error(session.message);
        } else {
          // session is successfully created, Show the verification modal.
          const { error } = await stripe.verifyIdentity(
            session.client_secret as string
          );

          if (error) {
            console.log("error", error.message);
            setError(error.message);
          } else {
            console.log("Verification submitted!");
            setSubmitted(true);
          }

          // update user table with the verification error and submitted true to show results if user refresh the page
          await fetch("/api/stripe/verification_submitted", {
            method: "POST",
            body: JSON.stringify({
              is_submitted: !error ? true : false,
              error: error ? error.message : null,
            }),
          });
        }
      })
      .catch((error: any) => toast.error(error.message));
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      {/* user is verified */}
      {submitted && !error && verified && (
        <>
          <CircleCheck width={40} height={40} className="text-green-500" />
          <h3 className="font-semibold text-lg mt-3">
            Congratulations! Your identity is verfied
          </h3>
        </>
      )}

      {/* document submitted but error occor */}
      {submitted && error && !verified && (
        <>
          <CircleX width={40} height={40} className="text-red-500" />
          <h3 className="font-semibold text-lg my-3">
            Opps! An error happened during verification
          </h3>
          <p className="text-base">{error}</p>
        </>
      )}

      {/* document submitted for verification */}
      {submitted && !error && !verified && (
        <>
          <h3 className="font-semibold text-lg mb-3">
            Thanks for submitting your identity document
          </h3>
          <p className="text-base">We are processing your verification.</p>
        </>
      )}

      {/* document is not submitted for verification, show button */}
      {(!submitted || error) && (
        <Button
          type="submit"
          variant="outline"
          className="mt-3"
          onClick={handleVerifyClick}
          disabled={loading}
        >
          Verify Your Identity
        </Button>
      )}
    </div>
  );
};

export default VerifyUser;
