const API_BASE =
  import.meta.env.VITE_API_BASE ??
  //"http://localhost:3000/api";
  "https://online-education-platform-backend-kappa.vercel.app/api";

export interface AuthUser {
  id: number;
  name: string;
  role: string;
}

export interface ApiClassStat {
  classId: string;
  className: string;
  totalStudents: number;
  averageScore: number;
  mentalHealthAlerts: number;
}

export interface ApiSchoolStat {
  schoolId: string;
  schoolName: string;
  totalClasses: number;
  totalStudents: number;
  overallAverageScore: number;
  totalMentalHealthAlerts: number;
}

export interface ApiStudent {
  id: string;
  name: string;
  email?: string;
}

function authHeaders() {
  const token = localStorage.getItem("lumen_token") ?? "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<{ userId: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Registration failed");
  return { userId: data.userId };
}

export async function apiSelectRole(
  userId: string,
  role: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/select-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Role selection failed");
}

export async function apiGetTeacherDashboard(): Promise<ApiClassStat[]> {
  const res = await fetch(`${API_BASE}/dashboard/teacher`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load dashboard");
  return data;
}

export async function apiGetAdminDashboard(): Promise<ApiSchoolStat> {
  const res = await fetch(`${API_BASE}/dashboard/admin`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load dashboard");
  return data;
}

export async function apiGetClassStudents(
  classId: string,
): Promise<ApiStudent[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load students");
  return data;
}
