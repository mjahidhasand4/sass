import { findUserByPhone } from "@/repository";
import bcrypt from "bcryptjs";
import NextAuth, { User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Create a separate config object for NextAuth
export const authConfig = {
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: { strategy: "jwt" as const },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text", placeholder: "1234567890" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Phone and password must be provided.");
        }

        const phone = credentials.phone as string;
        const password = credentials.password as string;
        const user = await findUserByPhone(phone);
        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        // Return user data that will be passed to the JWT callback
        return {
          id: user.id,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    // @ts-ignore
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },

    // @ts-ignore
    async session({ session, token }) {
      // Add properties to the session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
};

// Initialize NextAuth
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
