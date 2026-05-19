import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthResponse } from "@/types/auth";

function resolveBackendBaseUrl(): string {
  const isDev = process.env.NODE_ENV === "development";
  const raw = (
    process.env.NEXTAUTH_BACKEND_URL ||
    (isDev
      ? process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:8000"
      : process.env.NEXT_PUBLIC_API_URL)
  )?.trim();

  if (!raw) {
    throw new Error("Backend API URL is missing for NextAuth credentials login.");
  }

  return raw.replace(/\/+$/, "");
}

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        user_email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const userEmail = credentials?.user_email?.trim();
        const password = credentials?.password;
        if (!userEmail || !password) return null;

        const response = await fetch(`${resolveBackendBaseUrl()}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: userEmail,
            password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as AuthResponse;
        if (!data?.accessToken || !data?.user) return null;

        return {
          id: String(data.user.userId),
          name: data.user.userName,
          email: data.user.userEmail,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken ?? null;
        token.role = (user as { role?: string }).role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = (token.accessToken as string | null) ?? null;
      session.user.role = (token.role as string | null) ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
