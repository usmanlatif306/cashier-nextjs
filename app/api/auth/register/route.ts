import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
      },
    });

    await revalidateTag("users");

    return Response.json(
      {
        success: true,
        message: "New User Successfully Added.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        message:
          error.code === "P2002" ? "Email is already taken" : error.message,
      },
      { status: 500 }
    );
  }
}
