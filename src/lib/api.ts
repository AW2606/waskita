const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface VerificationData {
  id: string;
  user_id?: number | null;
  content_type: string;
  risk_level: "tenang" | "perlu_diperiksa" | "sangat_waspada" | string;
  score: number;
  explanation: string;
  technical_detail?: string | null;
  created_at: string;
}

export interface FamilyMemberData {
  id: number;
  user_id?: number | null;
  member_name: string;
  member_phone: string;
  relation?: string;
  status: "tenang" | "perlu_diperiksa" | "sangat_waspada" | string;
  created_at: string;
}

export interface ScenarioSummary {
  id: number;
  title: string;
}

export interface ScenarioDetail {
  id: number;
  title: string;
  narrative: string;
  choice_a: string;
  choice_b: string;
}

export interface ScenarioAnswerResponse {
  scenario_id: number;
  selected_choice: string;
  is_correct: boolean;
  correct_choice: string;
  explanation: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

/**
 * Register a new user account
 */
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal mendaftarkan akun baru.");
  }

  return response.json();
}

/**
 * Submit content for verification analysis
 */
export async function verifyContent(formData: FormData, token?: string): Promise<VerificationData> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Gagal memproses verifikasi (${response.statusText})`);
  }

  return response.json();
}

/**
 * Get verification detail by ID
 */
export async function getVerification(id: string, token?: string): Promise<VerificationData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/verify/${id}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Data verifikasi ID '${id}' tidak ditemukan.`);
  }

  return response.json();
}

/**
 * Get all registered family members
 */
export async function getFamilyMembers(token?: string): Promise<FamilyMemberData[]> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/family`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal mengambil daftar anggota keluarga.");
  }

  return response.json();
}

/**
 * Add a new family member
 */
export async function addFamilyMember(
  data: {
    member_name: string;
    member_phone: string;
    relation?: string;
  },
  token?: string
): Promise<FamilyMemberData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/family`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Gagal menambahkan anggota keluarga.");
  }

  return response.json();
}

/**
 * Get list of all educational scenarios (ID and Title)
 */
export async function getScenariosList(): Promise<ScenarioSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar skenario edukasi.");
  }

  return response.json();
}

/**
 * Get detail of a specific educational scenario
 */
export async function getScenarioDetail(id: number): Promise<ScenarioDetail> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil detail skenario ID ${id}.`);
  }

  return response.json();
}

/**
 * Submit answer for an educational scenario
 */
export async function answerScenario(
  id: number,
  choice: "a" | "b"
): Promise<ScenarioAnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scenarios/${id}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ choice }),
  });

  if (!response.ok) {
    throw new Error("Gagal mengirim jawaban skenario.");
  }

  return response.json();
}
