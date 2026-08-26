import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Placeholder authentication logic for early development
        if (
          credentials?.email === "admin@waskita.id" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "1",
            name: "Waskita Admin",
            email: "admin@waskita.id",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_dev_environment",
};
