"use server";

import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";

export const editUser = async (formData: FormData, id: string, key: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const value = formData.get(key) as string;
  try {
    const response = await prisma.user.update({
      where: {
        id: session?.user.id,
      },
      data: {
        [key]: value,
      },
    });

    //   revalidateTag(`${session.user.id}-states`);

    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
