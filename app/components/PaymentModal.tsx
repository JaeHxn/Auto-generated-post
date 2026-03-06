"use client";

import { useState } from "react";
import Script from "next/script";
import { X, CreditCard, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

type CreditOption = {
    id: string;
    name: string;
    price: number;
    credits: number;
    currency: "USD";
};

const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() ?? "";
const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

const CREDIT_OPTIONS: CreditOption[] = [
    {
        id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_10?.trim() ?? "",
        name: "10크레딧 충전",
        price: 1.5,
        credits: 10,
        currency: "USD",
    },
    {
        id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_50?.trim() ?? "",
        name: "50크레딧 충전 (10% 할인)",
        price: 6.5,
        credits: 50,
        currency: "USD",
    },
    {
        id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100?.trim() ?? "",
        name: "100크레딧 충전 (20% 할인)",
        price: 12.0,
        credits: 100,
        currency: "USD",
    },
].filter((option) => option.id.length > 0);

export default function PaymentModal({ onClose }: { onClose: () => void }) {
    const { data: session } = useSession();
    const [selectedOption, setSelectedOption] = useState<CreditOption | null>(CREDIT_OPTIONS[0] ?? null);
    const [paddle, setPaddle] = useState<any>(null);

    const isPaymentConfigured = clientToken.length > 0 && CREDIT_OPTIONS.length > 0;
    const [isInitializing, setIsInitializing] = useState(isPaymentConfigured);

    const handlePaddleLoad = () => {
        if (!isPaymentConfigured) {
            setIsInitializing(false);
            return;
        }

        // @ts-ignore
        if (window.Paddle) {
            // @ts-ignore
            window.Paddle.Environment.set(environment);
            // @ts-ignore
            window.Paddle.Initialize({
                token: clientToken,
                eventCallback: function (data: any) {
                    if (data.name === "checkout.completed") {
                        console.log("Paddle Checkout Completed!", data.data);
                        onClose();
                    }
                },
            });

            // @ts-ignore
            setPaddle(window.Paddle);
            setIsInitializing(false);
        }
    };

    const handlePayment = () => {
        if (!session?.user?.email) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!isPaymentConfigured || !selectedOption) {
            alert("결제 설정이 아직 완료되지 않았습니다. 관리자에게 문의해 주세요.");
            return;
        }

        if (!paddle) {
            alert("결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }

        paddle.Checkout.open({
            items: [
                {
                    priceId: selectedOption.id,
                    quantity: 1,
                },
            ],
            customer: {
                email: session.user.email,
            },
            customData: {
                userEmail: session.user.email,
                creditsToAdd: selectedOption.credits,
            },
        });
    };

    return (
        <>
            {isPaymentConfigured && (
                <Script
                    src="https://cdn.paddle.com/paddle/v2/paddle.js"
                    strategy="lazyOnload"
                    onLoad={handlePaddleLoad}
                />
            )}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
                <div className="relative z-10 bg-gradient-to-br from-[#1a1030] to-[#0d0720] border border-[#ff416c]/30 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_80px_rgba(255,65,108,0.4)] flex flex-col items-center gap-5">
                    <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white text-2xl">
                        <X size={24} />
                    </button>

                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff416c] to-[#8c52ff] flex items-center justify-center shadow-[0_0_30px_#ff416c]">
                                <Sparkles size={32} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-white text-2xl font-black">크레딧 충전</h2>
                        <p className="text-white/60 text-sm mt-2">필요한 만큼만 충전해서 사용하세요.</p>
                    </div>

                    {!isPaymentConfigured && (
                        <div className="w-full p-4 rounded-2xl border border-red-400/30 bg-red-400/10 text-red-200 text-sm">
                            결제 설정이 누락되어 충전을 시작할 수 없습니다.
                            <br />
                            <code>NEXT_PUBLIC_PADDLE_CLIENT_TOKEN</code>, <code>NEXT_PUBLIC_PADDLE_PRICE_ID_*</code> 값을 확인해 주세요.
                        </div>
                    )}

                    <div className="w-full flex flex-col gap-3 mt-2">
                        {CREDIT_OPTIONS.map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => setSelectedOption(opt)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedOption?.id === opt.id
                                    ? "border-[#ffde00] bg-[#ffde00]/10 shadow-[0_0_15px_rgba(255,222,0,0.3)]"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div>
                                    <div className="text-white font-bold">{opt.name}</div>
                                    <div className="text-white/50 text-xs mt-1">결제 후 즉시 반영됩니다.</div>
                                </div>
                                <div className="text-[#ffde00] font-black text-lg">${opt.price.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isInitializing || !isPaymentConfigured || !selectedOption}
                        className="w-full mt-2 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-[#ff416c] to-[#8c52ff] text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(140,82,255,0.5)]"
                    >
                        <CreditCard size={20} />
                        {isInitializing
                            ? "로딩 중..."
                            : !isPaymentConfigured || !selectedOption
                                ? "결제 준비 중"
                                : `$${selectedOption.price.toFixed(2)} 결제하기 (Paddle)`}
                    </button>
                </div>
            </div>
        </>
    );
}
