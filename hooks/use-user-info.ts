import { useEffect, useState } from "react";
import { CURRENT_USER } from "@/constants/token.constant";
import { User } from "@/prisma/generated/prisma-client";
import { fetcher } from "@/lib/fetcher";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import dayjs from "@/lib/dayjs";

export const useUserInfo = () => {
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [isNewUser, setIsNewUser] = useState<boolean | undefined>(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = localStorage.getItem(CURRENT_USER) || "";

    if (currentUser) {
      const { userId, userName, createdAt } = JSON.parse(currentUser);
      setCurrentUserId(userId);
      setUserName(userName);

      const startDate = dayjs("2024-02-01");
      setIsNewUser(dayjs(createdAt).isSameOrAfter(startDate));
    }
  }, []);

  const branch = getCookie("branch");

  const { data: userData } = useQuery<User>({
    queryKey: ["user", currentUserId],
    enabled: !!currentUserId && !!branch,
    queryFn: () => fetcher(`/api/user/${currentUserId}/${branch}`),
  });

  const { data: userCheckIn } = useQuery<[any]>({
    queryKey: ["check-in-result", currentUserId],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/check-in-result/${currentUserId}/${branch}`),
  });

  const { data: checkInItem } = useQuery<[any]>({
    queryKey: ["check-in-item"],
    enabled: !!userName,
    queryFn: () => fetcher(`/api/check-in-item`),
  });

  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: ["user", currentUserId] });
    queryClient.invalidateQueries({
      queryKey: ["check-in-result", currentUserId],
    });
    queryClient.invalidateQueries({ queryKey: ["check-in-item"] });
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    currentUserId,
    userName,
    userData,
    userCheckIn,
    checkInItem,
    isNewUser,
    refreshAllData,
  };
};
