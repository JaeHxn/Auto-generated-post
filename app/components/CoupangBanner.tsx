"use client";

import { useEffect, useRef } from "react";

export default function CoupangBanner() {
  // 쿠팡 자체 오류로 광고 생성이 안되어 임시로 숨김 처리 (주석 처리 역할)
  return null;

  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side and if the ad container exists
    if (typeof window !== "undefined" && adRef.current && !adRef.current.hasChildNodes()) {
      // 1. Load the Coupang partners script
      const script = document.createElement("script");
      script.src = "https://ads-partners.coupang.com/g.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        // 2. Initialize the ad inside the ref container
        if ((window as any).PartnersCoupang) {
          try {
            new (window as any).PartnersCoupang.G({
              "id": 985086,
              "template": "carousel",
              "trackingCode": "AF5449962",
              "width": "680",
              "height": "140",
              "tsource": "",
              "container": adRef.current
            });
          } catch (e) {
            console.error("Coupang Ad init error:", e);
          }
        }
      };
    }
  }, []);

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-[20px] p-5 sm:p-6 w-full max-w-[680px] mx-auto overflow-hidden">
      <div className="w-full flex justify-center min-h-[140px]" ref={adRef}>
        {/* 쿠팡 광고가 이 안에 렌더링됩니다 */}
      </div>

      <p className="mt-4 text-[11px] text-white/30 leading-relaxed border-t border-white/8 pt-3 text-center">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}
