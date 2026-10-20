const API_BASE = '/api';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('securedocs_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (data: { email: string; password: string; portalRole?: string }) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { email: string; otp: string }) => fetchWithAuth('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),

  // Documents
  getDocuments: (params?: { search?: string; classification?: string; minScore?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/documents${query ? `?${query}` : ''}`);
  },
  getDocumentDetail: (id: string) => fetchWithAuth(`/documents/${id}`),
  uploadDocument: (formData: FormData) => fetchWithAuth('/documents/upload', { method: 'POST', body: formData }),

  // Shares
  shareDocument: (data: { documentId: string; recipientEmail: string; customPermission?: string }) =>
    fetchWithAuth('/shares', { method: 'POST', body: JSON.stringify(data) }),
  getMyShares: () => fetchWithAuth('/shares/my-shares'),
  revokeShare: (id: string) => fetchWithAuth(`/shares/${id}`, { method: 'DELETE' }),

  // Audit Logs
  getAuditLogs: (params?: { action?: string; search?: string; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/audit-logs${query ? `?${query}` : ''}`);
  },

  // Analytics
  getAnalytics: () => fetchWithAuth('/analytics'),

  // Policies
  getPolicies: () => fetchWithAuth('/policies'),
  updatePolicy: (id: string, data: any) => fetchWithAuth(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Secure Authenticated Download
  downloadDocument: async (id: string, mode: 'encrypted' | 'decrypted' = 'encrypted') => {
    const token = localStorage.getItem('securedocs_token');
    const url = `${API_BASE}/documents/${id}/download?mode=${mode}&token=${encodeURIComponent(token || '')}`;
    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      let errMessage = 'Failed to download file';
      try {
        const errJson = await response.json();
        errMessage = errJson.error || errMessage;
      } catch {}
      throw new Error(errMessage);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `document-${id}.${mode === 'encrypted' ? 'pdf' : 'dat'}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }
};
