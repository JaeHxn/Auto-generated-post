import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
const authSecret = process.env.AUTH_SECRET?.trim();

const missingAuthEnv: string[] = [];
if (!googleClientId || !googleClientSecret) {
    missingAuthEnv.push("AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET");
}
if (!authSecret) {
    missingAuthEnv.push("AUTH_SECRET");
}

export const authRuntimeConfig = {
    enabled: missingAuthEnv.length === 0,
    missing: Array.from(new Set(missingAuthEnv)),
};

if (!authRuntimeConfig.enabled) {
    console.error("[AUTH] Disabled due to missing environment variables:", authRuntimeConfig.missing.join(", "));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: authRuntimeConfig.enabled
        ? [
            Google({
                clientId: googleClientId!,
                clientSecret: googleClientSecret!,
            }),
        ]
        : [],
    secret: authSecret ?? "auth-disabled-fallback-secret",
    callbacks: {
        async signIn({ user }) {
            // Keep sign-in resilient even if DB sync fails.
            if (!supabaseUrl || !supabaseServiceKey || !user.email) {
                return true;
            }

            try {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                const { data: existing, error } = await supabase
                    .from("users")
                    .select("id")
                    .eq("email", user.email)
                    .maybeSingle();

                if (error) {
                    console.error("Supabase user lookup failed in signIn callback:", error);
                    return true;
                }

                if (!existing) {
                    const { error: insertError } = await supabase.from("users").insert({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        daily_count: 0,
                        last_used_date: null,
                    });

                    if (insertError) {
                        console.error("Supabase user insert failed in signIn callback:", insertError);
                    }
                }
            } catch (error) {
                console.error("Unhandled signIn callback error:", error);
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
