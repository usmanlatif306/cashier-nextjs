import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const userId = session.user.id;

  try {
    const { is_submitted, error } = await request.json();

    // update verification result to user table
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        is_submitted: is_submitted,
        verification_error: error,
      },
    });

    return Response.json(
      {
        success: true,
        message: `User updated successfully`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message:
          error.code === "P2002" ? "Something went wrong" : error.message,
      },
      { status: 500 }
    );
  }
}
