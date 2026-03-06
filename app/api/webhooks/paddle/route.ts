import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

type PaddleTransaction = {
    id?: string;
    status?: string;
    details?: {
        totals?: {
            total?: string | number;
            currency_code?: string;
        };
    };
    custom_data?: {
        userEmail?: string;
        creditsToAdd?: number | string;
    };
};

function toMinorAmount(total: string | number | undefined, currencyCode?: string): number {
    const numeric = Number(total ?? 0);
    if (!Number.isFinite(numeric)) return 0;

    const code = (currencyCode ?? "").toUpperCase();
    const zeroDecimal = new Set(["KRW", "JPY"]);
    if (zeroDecimal.has(code)) {
        return Math.max(0, Math.round(numeric));
    }

    return Math.max(0, Math.round(numeric * 100));
}

async function insertPaymentAudit(params: {
    supabase: ReturnType<typeof getSupabaseAdmin>;
    userId: string | null;
    userEmail: string;
    transactionId: string;
    status: string;
    total: string | number | undefined;
    currencyCode?: string;
    creditsToAdd: number;
}) {
    const {
        supabase,
        userId,
        userEmail,
        transactionId,
        status,
        total,
        currencyCode,
        creditsToAdd,
    } = params;

    if (!supabase) {
        return { logged: false as const, reason: "supabase_unavailable" as const };
    }

    // Schema A (repo SQL): payments.transaction_id based.
    const schemaA = await supabase.from("payments").insert({
        transaction_id: transactionId,
        user_email: userEmail,
        amount: String(total ?? "0"),
        credits_added: creditsToAdd,
        status,
    });

    if (!schemaA.error) {
        return { logged: true as const, mode: "schemaA" as const };
    }

    const missingTransactionIdColumn =
        schemaA.error.code === "42703" && schemaA.error.message.includes("transaction_id");

    if (!missingTransactionIdColumn) {
        console.error("payments insert failed (schemaA):", schemaA.error);
        return { logged: false as const, reason: "schemaA_insert_failed" as const };
    }

    // Schema B (detected on current production DB):
    // id/user_id/report_id/stripe_session_id are required.
    if (!userId) {
        return { logged: false as const, reason: "schemaB_missing_user_id" as const };
    }

    const reportLookup = await supabase
        .from("reports")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (reportLookup.error) {
        console.error("payments schemaB report lookup failed:", reportLookup.error);
        return { logged: false as const, reason: "schemaB_report_lookup_failed" as const };
    }

    const reportId = reportLookup.data?.id ?? null;
    if (!reportId) {
        return { logged: false as const, reason: "schemaB_missing_report" as const };
    }

    const schemaB = await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        user_id: userId,
        report_id: reportId,
        stripe_session_id: transactionId,
        amount: toMinorAmount(total, currencyCode),
        currency: (currencyCode ?? "usd").toLowerCase(),
        status,
        user_email: userEmail,
        credits_added: creditsToAdd,
    });

    if (!schemaB.error) {
        return { logged: true as const, mode: "schemaB" as const };
    }

    console.error("payments insert failed (schemaB):", schemaB.error);
    return { logged: false as const, reason: "schemaB_insert_failed" as const };
}

export async function POST(req: Request) {
    try {
        const rawRequestBody = await req.text();
        const body = JSON.parse(rawRequestBody);

        if (body?.event_type !== "transaction.completed") {
            return NextResponse.json({ received: true, ignored: true }, { status: 200 });
        }

        const transaction = body?.data as PaddleTransaction | undefined;
        const customData = transaction?.custom_data;
        const userEmail = customData?.userEmail?.trim();
        const creditsToAdd = customData?.creditsToAdd ? Number(customData.creditsToAdd) : 0;

        if (!userEmail || !Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
            return NextResponse.json({ received: true, ignored: true }, { status: 200 });
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            console.error("Supabase admin client unavailable in webhook handler");
            return NextResponse.json({ received: true, creditsUpdated: false }, { status: 200 });
        }

        let userRecordId: string | null = null;
        let currentCredits = 0;

        const userLookup = await supabase
            .from("users")
            .select("id, credits")
            .eq("email", userEmail)
            .maybeSingle();

        if (userLookup.error) {
            console.error("Webhook user lookup failed:", userLookup.error);
            return NextResponse.json({ received: true, creditsUpdated: false }, { status: 200 });
        }

        if (userLookup.data) {
            userRecordId = userLookup.data.id;
            currentCredits = userLookup.data.credits || 0;
        } else {
            const userCreate = await supabase
                .from("users")
                .insert({
                    email: userEmail,
                    daily_count: 0,
                    last_used_date: null,
                    credits: 0,
                })
                .select("id, credits")
                .single();

            if (userCreate.error) {
                console.error("Webhook user create failed:", userCreate.error);
                return NextResponse.json({ received: true, creditsUpdated: false }, { status: 200 });
            }

            userRecordId = userCreate.data.id;
            currentCredits = userCreate.data.credits || 0;
        }

        const updateCredits = await supabase
            .from("users")
            .update({ credits: currentCredits + creditsToAdd })
            .eq("email", userEmail);

        if (updateCredits.error) {
            console.error("Webhook credits update failed:", updateCredits.error);
            return NextResponse.json({ received: true, creditsUpdated: false }, { status: 200 });
        }

        const paymentAudit = await insertPaymentAudit({
            supabase,
            userId: userRecordId,
            userEmail,
            transactionId: transaction?.id || `paddle_${Date.now()}`,
            status: transaction?.status || "completed",
            total: transaction?.details?.totals?.total,
            currencyCode: transaction?.details?.totals?.currency_code,
            creditsToAdd,
        });

        if (!paymentAudit.logged) {
            console.warn("Payment audit insert skipped/failed:", paymentAudit.reason);
        }

        console.log(`Successfully credited ${creditsToAdd} to ${userEmail}`);

        return NextResponse.json(
            {
                received: true,
                creditsUpdated: true,
                paymentLogged: paymentAudit.logged,
                paymentLogMode: paymentAudit.logged ? paymentAudit.mode : null,
                paymentLogReason: paymentAudit.logged ? null : paymentAudit.reason,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Paddle Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }
}
