import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pricing & Terms - Magic Seller</title>
        <style>
            body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
            h1 { font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 30px; }
            h3 { font-size: 16px; margin-top: 20px; }
            p { margin-bottom: 10px; }
            ul { margin-bottom: 20px; }
            .section { margin-bottom: 40px; }
        </style>
    </head>
    <body>
        <div class="section" id="pricing">
            <h1>Pricing (가격 안내)</h1>
            <p>Magic Seller는 고객이 필요한 만큼만 충전해서 사용할 수 있는 크레딧(Credit) 시스템을 제공합니다. 가입 및 매일 제공되는 기본 사용량은 무료입니다.</p>
            <ul>
                <li><strong>10 Credits (Basic):</strong> $1.50</li>
                <li><strong>50 Credits (Pro, 10% Off):</strong> $6.50</li>
                <li><strong>100 Credits (Premium, 20% Off):</strong> $12.00</li>
            </ul>
            <p>1회 생성 시 1크레딧이 차감되며, 구매한 크레딧은 계정이 활성화되어 있는 한 소멸되지 않습니다.</p>
        </div>

        <div class="section" id="terms">
            <h1>Terms of Service (서비스 약관)</h1>
            <p>최종 업데이트: 2024년 3월 5일</p>
            <h3>1. 서비스 제공</h3>
            <p>Magic Seller는 AI를 활용하여 중고 거래 판매글을 생성해주는 서비스입니다. 본 서비스는 "있는 그대로(As-Is)" 제공되며, 생성된 결과물의 정확성이나 거래 성사 여부를 보장하지 않습니다.</p>
            <h3>2. 사용자의 의무</h3>
            <p>사용자는 생성된 텍스트를 실제 거래 플랫폼에 등록하기 전에 반드시 내용을 검토하고 사실과 다른 부분을 수정해야 합니다. 허위 사실 기재로 인한 모든 법적 책임은 사용자 본인에게 있습니다.</p>
            <h3>3. 결제 및 크레딧</h3>
            <p>결제 처리는 글로벌 결제 대행사(Paddle)를 통해 안전하게 진행됩니다. 결제 완료 시 사용자의 계정에 명시된 수량의 크레딧이 즉시 충전됩니다.</p>
            
            <h2 id="refund">Refund Policy (환불 정책)</h2>
            <p>디지털 재화(크레딧)의 특성상 다음의 환불 정책을 따릅니다.</p>
            <ul>
                <li><strong>전액 환불:</strong> 결제 후 7일 이내이며, 충전된 크레딧을 단 1건도 사용하지 않은 경우 100% 환불이 가능합니다.</li>
                <li><strong>환불 불가:</strong> 충전된 크레딧 중 일부라도 사용한 경우, 혹은 결제일로부터 7일이 경과한 경우에는 원칙적으로 환불이 불가능합니다.</li>
                <li><strong>서비스 장애로 인한 환불:</strong> 당사의 서버 문제 등 귀책사유로 인해 크레딧을 사용할 수 없는 중대한 결함이 발생한 경우, 미사용 잔여 크레딧에 비례하여 부분 환불을 지원할 수 있습니다.</li>
            </ul>
            <p>환불 요청 및 문의: support@yourdomain.com</p>

            <h2 id="privacy">Privacy Policy (개인정보 보호정책)</h2>
            <p>당사는 서비스 제공을 위해 최소한의 정보만 수집합니다.</p>
            <ul>
                <li><strong>수집 항목:</strong> 이메일 주소, 이름(Google OAuth 제공), 결제 이력(Paddle 제공)</li>
                <li><strong>이용 목적:</strong> 계정 식별, 서비스 제공 비용 지불 관리, 사용자 히스토리 저장</li>
                <li><strong>보관 기간:</strong> 회원 탈퇴 시 즉시 파기 (단, 법규 제에 의한 결제 데이터는 보관)</li>
            </ul>
        </div>
    </body>
    </html>
    `,
        {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        }
    );
}
