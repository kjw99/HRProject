import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string | null;
    user: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  }

  interface User {
    role?: string | null;
    accessToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
    role?: string | null;
  }
}
