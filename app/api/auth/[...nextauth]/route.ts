import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// NextAuth route runs on Node runtime for stable OAuth flow.
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
