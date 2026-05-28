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

// ── Auth ──────────────────────────────────────────────────────────────

export async function apiLogin(
  credential: string,
  password: string,
): Promise<{ token: string; user: { id: string; name: string; role: string } }> {
  // Try email first, then phone
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

export async function apiGetProfile(): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}> {
  return request("/users/profile");
}

// ── Progress ──────────────────────────────────────────────────────────

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

// ── AI ────────────────────────────────────────────────────────────────

export interface ApiMentalHealthAssessment {
  currentScore: number;
  scoreDelta: number;
  statusLabel: 'GOOD' | 'NEUTRAL' | 'BAD';
  reasonSummary: string;
  signals: string[];
  emotionPolarity: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recordId: string;
  modelUsed: string;
}

export async function apiChat(body: {
  studentId: string;
  message: string;
  context?: Record<string, unknown>;
}): Promise<{ response: string; modelUsed: string; mentalHealth?: ApiMentalHealthAssessment }> {
  return request("/ai/chat", { method: "POST", body: JSON.stringify(body) });
}

export async function apiCheckMentalHealth(body: {
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}): Promise<ApiMentalHealthAssessment> {
  return request("/ai/mental-health", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
