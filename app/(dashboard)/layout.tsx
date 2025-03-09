"use client";

import React, { useEffect } from "react";
import { useUserInfo } from "@/hooks/use-user-info";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/queries/auth.query";
import { toast } from "sonner";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const loginMutation = useLogout();

  const currentUser = getCookie("currentUser");
  let user;

  const pathname = usePathname();

  const handleLogout = async () => {
    const result = await loginMutation.mutateAsync();
    const { statusCode, data, message } = result || {};
    if (statusCode === 200) {
      if (typeof window !== "undefined" && window.electron) {
        // @ts-ignore
        window.electron.send("close-app");
      }
    } else if (statusCode === 500) {
      toast.error(message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
        <nav>
          {/*<div className="flex justify-start mb-4">*/}
          {/*  <div className="flex gap-2">*/}
          {/*    <div className="flex items-center  px-3 py-1.5">*/}
          {/*      <span className="text-orange-500 uppercase font-semibold flex items-center gap-2">*/}
          {/*        {user?.userName}*/}
          {/*      </span>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <Link
            className={cn(
              "block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700",
              pathname === "/game" ? "bg-gray-700" : "transparent",
            )}
            href="/dashboard"
          >
            Phòng máy
          </Link>
          <div
            onClick={handleLogout}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 cursor-pointer"
          >
            Thoát
          </div>
        </nav>
      </div>

      <div className="flex-1 p-10 text-2xl font-bold bg-gray-400">
        {children}
      </div>
    </div>
  );
};

export default DashBoardLayout;
