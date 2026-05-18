import 'server-only';

import axios, { InternalAxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

export const apiServer = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiServer.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth-storage')?.value;

      if (authCookie) {
        const parsed = JSON.parse(decodeURIComponent(authCookie));
        const token = parsed.state.token;

        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    } catch (error) {
      console.error('[Server Axios Interceptor] 토큰 주입 실패:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
