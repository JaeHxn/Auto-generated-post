"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type AccessLog = {
  id: string;
  ip: string | null;
  country: string | null;
  user_agent: string | null;
  path: string | null;
  user_email: string | null;
  created_at: string;
};

type AdminStats = {
  totalUsers: number;
  todayActiveUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  recentAccessLogs: AccessLog[];
  countryBreakdown: { country: string; count: number }[];
  ipBreakdown: { ip: string; country: string; count: number; lastSeen: string }[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  KR: "🇰🇷", US: "🇺🇸", JP: "🇯🇵", CN: "🇨🇳", GB: "🇬🇧",
  DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳",
  BR: "🇧🇷", RU: "🇷🇺", IT: "🇮🇹", ES: "🇪🇸", MX: "🇲🇽",
  NL: "🇳🇱", SE: "🇸🇪", NO: "🇳🇴", SG: "🇸🇬", TW: "🇹🇼",
  HK: "🇭🇰", VN: "🇻🇳", TH: "🇹🇭", ID: "🇮🇩", PH: "🇵🇭",
};

function getCountryFlag(code: string | null): string {
  if (!code) return "🌐";
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "🌐";
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="text-3xl font-bold text-orange-400">
        {formatNumber(value)}
      </div>
      <div className="mt-1 text-sm text-gray-400">{label}</div>
    </div>
  );
}

function CountryBar({
  country,
  count,
  max,
}: {
  country: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-gray-300">
        {getCountryFlag(country)} {country || "Unknown"}
      </span>
      <div className="flex-1 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-2 rounded-full bg-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm font-medium text-orange-400">
        {formatNumber(count)}
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status})`);
      }
      const data = await res.json() as AdminStats;
      setStats(data);
      setLastUpdated(new Date());
      setFetchError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFetchError(err.message);
      } else {
        setFetchError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Proceed with redirect regardless
    } finally {
      router.replace("/admin");
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-700 border-t-orange-400" />
          <p className="text-sm text-gray-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (fetchError && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-8 text-center">
          <p className="mb-4 text-red-300">데이터를 불러올 수 없습니다.</p>
          <p className="mb-6 text-sm text-red-400">{fetchError}</p>
          <button
            onClick={() => { setIsLoading(true); fetchStats(); }}
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const maxCountry = stats?.countryBreakdown[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              ⚡ Magic Seller 관리자 대시보드
            </h1>
            {lastUpdated && (
              <p className="mt-0.5 text-xs text-gray-500">
                마지막 업데이트: {formatDateTime(lastUpdated.toISOString())}
                {fetchError && (
                  <span className="ml-2 text-red-400">
                    (갱신 실패: {fetchError})
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* ── Stat cards ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            핵심 지표
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="총 가입자 수"
              value={stats?.totalUsers ?? 0}
              icon="👤"
            />
            <StatCard
              label="오늘 활성 사용자"
              value={stats?.todayActiveUsers ?? 0}
              icon="🟢"
            />
            <StatCard
              label="총 생성 횟수"
              value={stats?.totalGenerations ?? 0}
              icon="✨"
            />
            <StatCard
              label="오늘 생성 횟수"
              value={stats?.todayGenerations ?? 0}
              icon="📝"
            />
          </div>
        </section>

        {/* ── Country breakdown ─────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            국가별 접속 현황
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            {stats && stats.countryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.countryBreakdown.map(({ country, count }) => (
                  <CountryBar
                    key={country}
                    country={country}
                    count={count}
                    max={maxCountry}
                  />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                데이터 없음
              </p>
            )}
          </div>
        </section>

        {/* ── IP breakdown ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            IP별 접속 현황
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">IP 주소</th>
                  <th className="px-4 py-3">국가</th>
                  <th className="px-4 py-3 text-right">접속 횟수</th>
                  <th className="px-4 py-3">마지막 접속</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stats && stats.ipBreakdown.length > 0 ? (
                  stats.ipBreakdown.map(({ ip, country, count, lastSeen }) => (
                    <tr key={ip} className="transition hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-gray-300">{ip}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {getCountryFlag(country)} {country || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-400">
                        {formatNumber(count)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {formatDateTime(lastSeen)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Recent access logs ────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            최근 접속 로그
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800 text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">접속 시각</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">국가</th>
                  <th className="px-4 py-3">경로</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stats && stats.recentAccessLogs.length > 0 ? (
                  [...stats.recentAccessLogs]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((log) => (
                      <tr key={log.id} className="transition hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-300">
                          {log.ip ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {log.country
                            ? `${getCountryFlag(log.country)} ${log.country}`
                            : "—"}
                        </td>
                        <td className="max-w-[140px] truncate px-4 py-3 text-gray-300">
                          {log.path ?? "—"}
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-gray-400">
                          {log.user_email ?? "—"}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-500">
                          {log.user_agent
                            ? log.user_agent.slice(0, 60)
                            : "—"}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
