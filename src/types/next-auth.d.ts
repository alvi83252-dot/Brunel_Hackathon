import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "PARTICIPANT" | "JUDGE";
  }

  interface Session {
    user: {
      id: string;
      role: "PARTICIPANT" | "JUDGE";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "PARTICIPANT" | "JUDGE";
  }
}
