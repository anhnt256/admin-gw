"use client";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/queries/auth.query";
import { useAction } from "@/hooks/use-action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createUser } from "@/actions/create-user";
import { getCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import { BRANCH } from "@/constants/enum.constant";
import { Spin } from "antd";
import { isElectron } from "@/lib/electron";
import { getMacAddresses } from "@/lib/mac";
import { useQuery } from "@tanstack/react-query";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

const Login = () => {
  const [userName, setUserName] = useState<string>("casang");
  const [password, setPassword] = useState<string>("P@ssword@2024.");
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState(true);
  const loginMutation = useLogin();
  const router = useRouter();

  const [macAddresses, setMacAddresses] = useState<string>();
  const [isDesktopApp, setIsDesktopApp] = useState(false);

  const { data: machineData } = useQuery({
    queryKey: ["check-branch"],
    enabled: !!macAddresses,
    queryFn: () => fetch("/api/check-branch").then((res) => res.json()),
  });

  useEffect(() => {
    let mounted = true;

    const checkPlatform = async () => {
      if (!mounted) return;

      setIsDesktopApp(isElectron());
      if (isElectron()) {
        try {
          const addresses = (await getMacAddresses()) as any;
          if (mounted) {
            setMacAddresses(addresses[0]?.address);
            setCookie("macAddress", addresses[0]?.address, {
              expires: new Date(expirationDate),
            });
          }
        } catch (error) {
          console.error("Failed to get MAC addresses:", error);
        }
      } else {
        if (mounted) {
          setCookie("macAddress", "00:cf:e0:46:c1:81", {
            expires: new Date(expirationDate),
          });
        }
      }
      if (mounted) {
        setInitializing(false);
      }
    };

    checkPlatform();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (machineData) {
      onLogin();
    }
  }, [machineData]);

  const onLogin = async () => {
    if (pageLoading) {
      return;
    }
    if (machineData) {
    setPageLoading(true);
    const result = await loginMutation.mutateAsync({ userName, password });
    setPageLoading(false);
    const { statusCode, data, message } = result || {};

    if (statusCode === 200) {
      toast.success("Chào mừng đến với The GateWay!");
      router.push("/dashboard");
    } else if (statusCode === 500 || statusCode === 499) {
      toast.error(message);
    }
    }
  };

  if (initializing || pageLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" tip="Loading..." spinning={true} />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-2">
        <Image
          src="/logo.png"
          alt="Logo"
          className="rounded-full"
          width={100}
          height={100}
        />
      </div>
      {!isDesktopApp && (
        <div>
          <p>MAC addresses are only available in the desktop app.</p>
          <p>Please download our desktop application to access this feature.</p>
        </div>
      )}
      <div className="mb-4">
        <Label htmlFor="email" className="block text-sm font-bold mb-2">
          Tên đăng nhập
        </Label>
        <Input
          id="email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="password" className="block text-sm font-bold mb-2">
          Mật khẩu
        </Label>
        <Input
          id="password"
          type="password"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button
          disabled={initializing}
          onClick={() => onLogin()}
          variant="default"
          className="w-full justify-start bg-orange-400"
          size="default"
        >
          Đăng nhập
        </Button>
      </div>
    </>
  );
};

export default Login;
