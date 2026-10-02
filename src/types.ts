export type EventStatus = 'REGISTRATION' | 'DRAW_COMPLETED' | 'GIFT_EXCHANGE' | 'COMPLETED';

export interface SecretSantaEvent {
  id: string;
  code: string; // e.g. "VJN-XMAS-8K4P"
  title: string;
  organizerName: string;
  organizerEmail?: string;
  exchangeDate?: string;
  location?: string;
  status: EventStatus;
  revealIdentities: boolean;
  isRegistrationLocked: boolean;
  createdAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  secretToken: string;
  joinedAt: string;
}

export interface Assignment {
  id: string;
  eventId: string;
  giverId: string;
  receiverId: string;
  createdAt: string;
}

// Client response for public event view
export interface PublicEventInfo {
  code: string;
  title: string;
  organizerName: string;
  exchangeDate?: string;
  location?: string;
  status: EventStatus;
  revealIdentities: boolean;
  isRegistrationLocked: boolean;
  participantCount: number;
}

// Client response for participant secret page
export interface ParticipantSecretView {
  event: PublicEventInfo;
  me: {
    id: string;
    name: string;
    secretToken: string;
  };
  hasDrawn: boolean;
  recipient?: {
    id: string;
    name: string;
  };
  mySanta?: {
    name: string;
  }; // Only populated when event.revealIdentities === true!
}

// Admin response
export interface AdminEventView {
  event: SecretSantaEvent;
  participants: (Participant & { hasDrawnAssignment?: boolean })[];
  assignmentsCount: number;
}
