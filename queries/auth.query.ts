import { useMutation } from "@tanstack/react-query";
import { deleteCookie, setCookie } from "cookies-next";
import { ACCESS_TOKEN_KEY, CURRENT_USER } from "@/constants/token.constant";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";

const expirationDuration = 1;
const expirationDate = dayjs().add(expirationDuration, "day").format();

export const postLogin = async ({
  userName,
  password,
}: {
  userName: string;
  password: string;
}): Promise<any> => {
  const result = await fetch("api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userName, password }),
  });

  const resultText = await result.text();

  if (resultText.includes("Duplicate account")) {
    return {
      statusCode: 499,
      data: null,
      message:
        "Bạn có tài khoản tại 2 chi nhánh, để tránh nhầm lẫn, vui lòng liên hệ nhân viên để được xử lý chính xác. Xin cảm ơn.",
    };
  }

  if (resultText !== "Internal Error") {
    const data = JSON.parse(resultText);

    const { id } = data || {};
    localStorage.setItem(CURRENT_USER, JSON.stringify(data));
    return { statusCode: 200, data: id, message: "Login Success" };
  }

  return {
    statusCode: 500,
    data: null,
    message:
      "Thông tin tài khoản hoặc chi nhánh không đúng. Vui lòng kiểm tra và thử lại!",
  };
};

export const postLogout = async (): Promise<any> => {
  const result = await fetch("api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resultText = await result.text();

  if (resultText !== "Internal Error") {
    deleteCookie(ACCESS_TOKEN_KEY);
    localStorage.clear();
    return { statusCode: 200, data: null };
  }
};

export const useLogin = () => useMutation({ mutationFn: postLogin });
export const useLogout = () => useMutation({ mutationFn: postLogout });
