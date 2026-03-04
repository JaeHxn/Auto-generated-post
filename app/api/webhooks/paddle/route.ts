import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const rawRequestBody = await req.text();
        const body = JSON.parse(rawRequestBody);

        const eventData = body;

        // eventData.eventType 으로 진행
        if (eventData?.event_type === "transaction.completed") {
            const transaction = eventData.data as any;

            // CustomData에서 매핑 정보 추출
            const customData = transaction.custom_data;
            const userEmail = customData?.userEmail;
            const creditsToAdd = customData?.creditsToAdd ? Number(customData?.creditsToAdd) : 0;
            const amount = transaction.details?.totals?.total || "0";

            if (userEmail && creditsToAdd > 0) {
                const supabase = getSupabaseAdmin();
                if (supabase) {
                    // 유저 메일 기준 기존 크레딧 조회
                    const { data: userRecord } = await supabase
                        .from("users")
                        .select("credits")
                        .eq("email", userEmail)
                        .single();

                    const currentCredits = userRecord?.credits || 0;
                    const newCredits = currentCredits + creditsToAdd;

                    // 유저 크레딧 업데이트
                    await supabase
                        .from("users")
                        .update({ credits: newCredits })
                        .eq("email", userEmail);

                    // 백업용 결제 내역 저장
                    await supabase
                        .from("payments")
                        .insert({
                            transaction_id: transaction.id,
                            user_email: userEmail,
                            amount: String(amount),
                            credits_added: creditsToAdd,
                            status: transaction.status,
                        });

                    console.log(`Successfully credited ${creditsToAdd} to ${userEmail}`);
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        console.error("Paddle Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }
}
