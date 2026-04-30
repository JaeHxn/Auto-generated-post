"use client";

import { useEffect, useRef } from "react";

export default function CoupangBanner() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // browsingtopics는 Privacy Sandbox 실험용 비표준 속성 — ref로 직접 주입
    if (iframeRef.current) {
      iframeRef.current.setAttribute("browsingtopics", "");
    }
  }, []);

  return (
    <aside
      aria-label="쿠팡 추천 상품"
      className="mx-auto my-4 w-full max-w-[680px] overflow-hidden rounded-md border border-white/10 bg-white/[0.03]"
    >
      <div className="mx-auto overflow-hidden">
        <iframe
          ref={iframeRef}
          src="https://ads-partners.coupang.com/widgets.html?id=985313&template=carousel&trackingCode=AF5449962&subId=&width=680&height=140&tsource="
          width="680"
          height="140"
          frameBorder={0}
          scrolling="no"
          referrerPolicy="unsafe-url"
          title="쿠팡 추천 상품"
          className="block w-full"
        />
      </div>
      <p className="px-3 pb-2 text-center text-[11px] leading-tight text-white/35">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </aside>
  );
}
