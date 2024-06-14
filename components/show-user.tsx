"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSession, SignInResponse, signIn } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";

const ShowUser = ({ user }: { user: User }) => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && session?.user.email === user.email) {
      router.push(`/${user.role}`);
      router.refresh();
      toast.success("Successfully logged in.");
    }
  }, [session, router]);

  async function handleSignIn() {
    const response: SignInResponse | undefined = await signIn("credentials", {
      email: user.email,
      password: "password",
      redirect: false,
    });

    if (response?.error) {
      toast.error("Failed to sign in!");
    }
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="capitalize">{user.role}</TableCell>
        <TableCell>
          <Button type="submit" variant="outline" onClick={handleSignIn}>
            Sign In
          </Button>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ShowUser;
