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

/**
 * Submit content for verification analysis
 */
export async function verifyContent(formData: FormData): Promise<VerificationData> {
  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal memproses verifikasi: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Get verification detail by ID
 */
export async function getVerification(id: string): Promise<VerificationData> {
  const response = await fetch(`${API_BASE_URL}/api/verify/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Data verifikasi ID '${id}' tidak ditemukan.`);
  }

  return response.json();
}

/**
 * Get all registered family members
 */
export async function getFamilyMembers(): Promise<FamilyMemberData[]> {
  const response = await fetch(`${API_BASE_URL}/api/family`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar anggota keluarga.");
  }

  return response.json();
}

/**
 * Add a new family member
 */
export async function addFamilyMember(data: {
  member_name: string;
  member_phone: string;
  relation?: string;
}): Promise<FamilyMemberData> {
  const response = await fetch(`${API_BASE_URL}/api/family`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Gagal menambahkan anggota keluarga.");
  }

  return response.json();
}
