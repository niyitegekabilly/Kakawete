import type {
  PublicEventInfo,
  ParticipantSecretView,
  AdminEventView,
  Participant,
  SecretSantaEvent,
} from './types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  async getPublicEvent(code: string): Promise<PublicEventInfo> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}`);
    return handleResponse<PublicEventInfo>(res);
  },

  async createEvent(payload: {
    title: string;
    organizerName: string;
    organizerEmail?: string;
    adminPin: string;
    exchangeDate?: string;
    location?: string;
  }): Promise<{ code: string; eventId: string; shareUrl: string; title: string }> {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async adminLogin(code: string, pin: string): Promise<{ success: boolean; adminToken: string }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    return handleResponse(res);
  },

  async getAdminDashboard(code: string, token: string): Promise<AdminEventView> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<AdminEventView>(res);
  },

  async adminAddParticipant(
    code: string,
    token: string,
    name: string
  ): Promise<{ success: boolean; participant: Participant }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  async adminBatchAddParticipants(
    code: string,
    token: string,
    names: string[]
  ): Promise<{ success: boolean; addedCount: number }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/participants/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ names }),
    });
    return handleResponse(res);
  },

  async adminDeleteParticipant(code: string, token: string, participantId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/participants/${participantId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async executeDraw(
    code: string,
    token: string
  ): Promise<{ success: boolean; message: string; count: number; status: string }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/draw`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async resetDraw(code: string, token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/reset-draw`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async toggleReveal(
    code: string,
    token: string
  ): Promise<{ success: boolean; revealIdentities: boolean; status: string }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/admin/toggle-reveal`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  async joinEvent(
    code: string,
    name: string
  ): Promise<{
    success: boolean;
    participant: Participant;
    secretUrl: string;
    message: string;
    alreadyJoined?: boolean;
  }> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  async getParticipantSecretView(code: string, token: string): Promise<ParticipantSecretView> {
    const res = await fetch(`${BASE_URL}/events/${encodeURIComponent(code)}/participant/${token}`);
    return handleResponse<ParticipantSecretView>(res);
  },

  async resetDemo(): Promise<void> {
    await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
  },
};
