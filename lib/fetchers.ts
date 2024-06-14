import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export async function fetch_user(id: string) {
  return await unstable_cache(
    async () => {
      return await prisma.user.findUnique({
        where: {
          id,
        },
      });
    },
    [`user-${id}`],
    {
      revalidate: 900,
      tags: [`user-${id}`],
    }
  )();
}

export async function fetch_users(limit?: number) {
  return await unstable_cache(
    async () => {
      return prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        ...(limit ? { take: limit } : {}),
      });
    },
    [`users`],
    {
      revalidate: 900,
      tags: [`users`],
    }
  )();
}
