import Link from "next/link";

const primaryLinks = [
  { href: "/about", label: "서비스 소개" },
  { href: "/guide", label: "판매글 가이드" },
  { href: "/legal", label: "이용 안내" },
  { href: "/contact", label: "문의" },
];

const policyLinks = [
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용약관" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-[18px]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ffb88c]">Magic Seller</p>
          <h2 className="mt-3 text-2xl font-black text-white">중고 판매글 자동 작성 도구와 운영 정보</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
            Magic Seller는 당근, 중고나라, 번개장터에 올릴 판매글을 AI로 정리해 주는 웹 서비스입니다.
            도구 설명, 운영 정보, 문의 경로, 개인정보 처리 기준을 한 사이트 안에서 확인할 수 있도록 구성했습니다.
          </p>
          <p className="mt-4 text-sm text-white/55">문의: luvsoul@kakao.com</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">사이트 메뉴</h3>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">정책 및 광고 안내</h3>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
            <a
              href="https://support.google.com/adsense/answer/1348695?hl=ko"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Google 광고 쿠키 안내
            </a>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-white/5 px-5 py-5 sm:px-8">
        <p className="text-xs text-white/30 leading-relaxed">
          이 사이트의 일부 링크는 쿠팡 파트너스 활동의 일환으로, 해당 링크를 통해 구매 시 일정액의 수수료를 제공받을 수 있습니다.
        </p>
      </div>
    </footer>
  );
}
