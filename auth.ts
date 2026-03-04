import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // Supabase에 유저가 없으면 자동 생성
            if (supabaseUrl && supabaseServiceKey && user.email) {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                const { data: existing } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", user.email)
                    .single();

                if (!existing) {
                    await supabase.from("users").insert({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        daily_count: 0,
                        last_used_date: null,
                    });
                }
            }
            return true;
        },
        async session({ session }) {
            return session;
        },
    },
    pages: {
        error: "/",
    },
});
