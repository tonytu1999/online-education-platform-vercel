import { useAppStore } from "./store";

const API_BASE = "https://online-education-platform-backend-kappa.vercel.app/api";

function getToken(): string | null {
  return useAppStore.getState().token;
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...opts?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `API ${res.status}`);
  }
  return res.json();
}

// Auth

export async function apiLogin(
  credential: string,
  password: string,
): Promise<{ token: string; user: { id: string; name: string; role: string } }> {
  const body = credential.includes("@")
    ? { email: credential, password }
    : { phone: credential, password };
  return request("/auth/login", { method: "POST", body: JSON.stringify(body) });
}

export async function apiRegister(body: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}): Promise<{ message: string; userId: string }> {
  return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
}

export async function apiSelectRole(
  userId: string,
  role: string,
): Promise<{ message: string; userId: string; role: string }> {
  const res = await fetch(`${API_BASE}/auth/select-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `API ${res.status}`);
  }
  return res.json();
}

export async function apiGetProfile(): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}> {
  return request("/users/profile");
}

// Progress

export type ApiMastery = "UNMASTERED" | "PARTIAL" | "MASTERED";

export interface ApiProgressItem {
  studentId: string;
  knowledgePointId: string;
  mastery: ApiMastery;
  studyTimeSeconds: number;
  knowledgePoint: {
    id: string;
    name: string;
    desc: string;
    chapter: {
      id: string;
      name: string;
      subject: {
        id: string;
        name: string;
        emoji: string;
      };
    };
  };
}

export async function apiGetProgress(studentId: string): Promise<ApiProgressItem[]> {
  return request(`/progress/${studentId}`);
}

export async function apiUpdateProgress(body: {
  studentId: string;
  knowledgePointId: string;
  mastery: ApiMastery;
  studyTimeSeconds?: number;
}): Promise<any> {
  return request("/progress/update", { method: "POST", body: JSON.stringify(body) });
}

// AI Chat (session-based)

export async function apiCreateChatSession(body: {
  type: "Socratic" | "Mental";
  title?: string;
  subject?: string;
  topic?: string;
  chapter?: string;
  knowledgepoint?: string;
  systemPrompt?: string;
}): Promise<{ session: { id: string; sessionId: string; title: string; sessionType: string; subject: string | null; topic: string | null } }> {
  console.log("[apiCreateChatSession] Creating session:", JSON.stringify(body));
  return request("/ai/sessions", { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetChatSessions(): Promise<{ sessions: any[] }> {
  return request("/ai/sessions");
}

export async function apiGetChatSession(sessionId: string): Promise<{ session: any }> {
  return request(`/ai/sessions/${sessionId}`);
}

export async function apiDeleteChatSession(sessionId: string): Promise<{ message: string }> {
  return request(`/ai/sessions/${sessionId}`, { method: "DELETE" });
}

export async function apiChat(body: {
  sessionId: string;
  message: string;
}): Promise<{ response: string; modelUsed: string; sessionId: string }> {
  return request("/ai/chat", { method: "POST", body: JSON.stringify(body) });
}

export async function apiGetStudentUuidByEmail(email: string): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/users/uuid-by-email?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function apiBindChild(childId: string): Promise<{ message: string }> {
  return request("/users/bind-child", { method: "POST", body: JSON.stringify({ childId }) });
}

// ── Mental Health ──────────────────────────────────────────────────────────

export interface MentalHealthRecord {
  id: string;
  statusScore: number;
  scoreDelta: number;
  statusLabel: string;
  reasonSummary: string;
  signals: string[];
  emotionPolarity: string;
  riskLevel: string;
  keywords: string[];
  createdAt: string;
}

export interface MentalHealthTrendPoint {
  date: string;
  statusScore: number;
  scoreDelta: number;
  statusLabel: string;
  emotionPolarity: string;
  riskLevel: string;
}

export interface MentalHealthHistory {
  studentId: string;
  latestScore: number;
  latestStatusLabel: string;
  latestEmotionPolarity: string;
  latestRiskLevel: string;
  latestSignals: string[];
  trend: MentalHealthTrendPoint[];
  records: MentalHealthRecord[];
}

export async function apiGetMentalHealthHistory(
  studentId: string,
  opts?: { limit?: number }
): Promise<MentalHealthHistory> {
  const qs = opts?.limit ? `?limit=${opts.limit}` : '';
  return request(`/ai/mental-health/${studentId}${qs}`);
}

export interface SessionMentalHealthResult {
  sentimentScore: number;
  scoreDelta: number;
  currentScore: number;
  statusLabel: string;
  emotionPolarity: string;
  riskLevel: string;
  signals: string[];
  reasonSummary: string;
  recordId: string;
}

export async function apiCheckSessionMentalHealth(
  sessionId: string
): Promise<SessionMentalHealthResult> {
  return request(`/ai/sessions/${sessionId}/mental-health`, { method: "POST" });
}

// ── Children (from backend) ───────────────────────────────────────────────

export async function apiGetChildren(): Promise<Array<{ id: string; name: string; email: string | null; phone: string | null }>> {
  return request("/users/children");
}
