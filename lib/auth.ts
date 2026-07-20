import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        // NOTE: do not include `image`/avatarUrl here. Avatars are stored as
        // multi-MB base64 data URLs; baking one into the JWT session cookie
        // blows past Node's ~16 KB request-header limit and makes every
        // authenticated request fail with HTTP 431. The UI reads the avatar
        // from the app store / /api/user instead.
        return { id: user.id, name: user.name ?? "", email: user.email };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.currency = (user as { currency?: string }).currency;
      }
      // Keep the session cookie small: never persist the avatar (a large
      // base64 data URL) or any other bulky field, or authenticated requests
      // will fail with HTTP 431 (request header too large).
      delete token.picture;
      delete token.image;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      if (session.user && token.currency)
        (session.user as { currency?: string }).currency = token.currency as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
