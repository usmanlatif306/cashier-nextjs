"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg p-1.5 text-white transition-all duration-150 ease-in-out  active:bg-gray-300 dark:text-white  dark:active:bg-gray-800 flex items-center gap-3"
    >
      Logout <LogOut width={18} />
    </button>
  );
}
