import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Constants from "expo-constants";
import { useRouter } from 'expo-router';
import authStorage from './authStorage';

const { apiBaseUrl} = Constants.expoConfig?.extra ?? {};

const router = useRouter();

const api = axios.create({
  baseURL: apiBaseUrl,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (originalRequest?.url?.includes('/auth/login')) {
        if (error.response) {
          return Promise.reject(error.response.data);
        }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        console.log("Requesting refresh token");
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await authStorage.getRefreshToken();
        if (!refreshToken) {
          // justLogout();
          await authStorage.clear();
          router.replace('/auth/login');
          return Promise.reject(new Error("No refresh token available"));
        }

        const newAccessToken = await refreshTokenfunc(refreshToken);

        processQueue(null, newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        // justLogout();
        await authStorage.clear();
        router.replace('/auth/login');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const refreshTokenfunc = async (refreshToken: string): Promise<string> => {
  const res = await axios.post(`${apiBaseUrl}/auth/refreshToken`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        await authStorage.setAccessToken(newAccessToken);
        await authStorage.setRefreshToken(res.data.refreshToken);
        return newAccessToken;
};

export default api;
