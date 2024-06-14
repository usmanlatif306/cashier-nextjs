import LogoutButton from "@/components/logout-button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* header */}
      <div className="w-full bg-gradient-to-t from-blue-400 to-indigo-600 rounded h-12 flex items-center justify-between text-white p-3">
        <h4 className="text-lg font-semibold capitalize">
          {session?.user?.role} view
        </h4>
        <LogoutButton />
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
};

export default DashboardLayout;
