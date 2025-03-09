import { ACCESS_TOKEN_KEY } from "@/constants/token.constant";
import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { getCookie } from "cookies-next";

let host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
let secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;

const isServer = typeof window === "undefined";

const apiClient = axios.create({
  baseURL: host,
  withCredentials: true,
});

const logOnDev = (
  message: string,
  log?: AxiosResponse | InternalAxiosRequestConfig | AxiosError,
) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, log);
  }
};

apiClient.interceptors.request.use(async (request) => {
  if (isServer) {
    const cookie = request.headers.Cookie;
    const tokenString = request.headers.Token;

    let token = null;
    if (tokenString) {
      token = JSON.parse(tokenString);
    }

    if (cookie && cookie === "TAN_PHU") {
      host = process.env.NEXT_PUBLIC_GATEWAY_TAN_PHU_API;
      secretKey = process.env.NEXT_PUBLIC_GATEWAY_TAN_PHU_SECRET_KEY;
    } else {
      host = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_API;
      secretKey = process.env.NEXT_PUBLIC_GATEWAY_GO_VAP_SECRET_KEY;
    }

    request.baseURL = host;

    if (token) {
      request.headers["Authorization"] = `Bearer ${token.token}`;
    } else if (secretKey) {
      request.headers["Authorization"] = `Key ${secretKey}`;
    }
  } else {
    const token = getCookie(ACCESS_TOKEN_KEY);
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  //#region StartDebug
  // const { method, url } = request || {};
  // logOnDev(`🚀 [${method?.toUpperCase()}] ${url} | Request`, request);
  //#endregion

  return request;
});

apiClient.interceptors.response.use(
  (response) => {
    //#region StartDebug
    // const { method, url } = response.config;
    // const { status } = response;
    // logOnDev(
    //   `✨ [${method?.toUpperCase()}] ${url} | Response ${status}`,
    //   response,
    // );
    //#endregion
    return response;
  },
  (error) => {
    //#region StartDebug
    // const { message } = error;
    // const { status, data } = error.response;
    // const { method, url } = error.config;
    //
    // logOnDev(
    //   `🚨 [${method?.toUpperCase()}] ${url} | Error ${status} ${
    //     data?.message || ""
    //   } | ${message}`,
    //   error,
    // );
    //#endregion

    return Promise.reject(error);
  },
);

export default apiClient;
