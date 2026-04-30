export type AccessLog = {
  id: string;
  ip: string | null;
  country: string | null;
  user_agent: string | null;
  path: string | null;
  user_email: string | null;
  created_at: string;
};

export type AdminStats = {
  totalUsers: number;
  todayActiveUsers: number;
  totalGenerations: number;
  todayGenerations: number;
  recentAccessLogs: AccessLog[];
  countryBreakdown: { country: string; count: number }[];
  ipBreakdown: { ip: string; country: string; count: number; lastSeen: string }[];
};
