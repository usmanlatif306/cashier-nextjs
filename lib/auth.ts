import { getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        if (credentials?.email && credentials?.password) {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          return user ? user : null;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: `/`,
    verifyRequest: `/`,
    error: "/", // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user, trigger, session, account }) => {
      if (trigger === "update" && session) {
        return { ...token, ...session?.user };
      }
      if (user) {
        token.user = user;
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        role: token?.user?.role,
      };

      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions) as Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: string;
    };
  } | null>;
}
