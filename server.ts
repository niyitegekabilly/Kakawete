import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type {
  EventStatus,
  SecretSantaEvent,
  Participant,
  Assignment,
  PublicEventInfo,
  ParticipantSecretView,
  AdminEventView,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

interface DatabaseSchema {
  events: Record<string, SecretSantaEvent & { adminPinHash: string }>;
  participants: Record<string, Participant>;
  assignments: Record<string, Assignment[]>; // eventId -> Assignment[]
}

const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'secret_santa_db.json');

// In-memory cache
let db: DatabaseSchema = {
  events: {},
  participants: {},
  assignments: {},
};

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateEventCode(title: string): string {
  const prefix = title.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'XMA';
  const mid = 'XMAS';
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${mid}-${rand}`;
}

function saveDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db file:', err);
  }
}

function seedInitialData() {
  const demoCode = 'VJN-XMAS-8K4P';
  const demoEventId = 'evt_vjn_2026';

  db.events[demoCode] = {
    id: demoEventId,
    code: demoCode,
    title: "KAKAWETE Y'ITSINDA DUFATANYE VJN",
    organizerName: 'Jean Bosco',
    organizerEmail: 'bosco@vjn.rw',
    adminPinHash: hashPin('1234'),
    exchangeDate: '2026-12-20',
    location: 'VJN Office',
    status: 'REGISTRATION',
    revealIdentities: false,
    isRegistrationLocked: false,
    createdAt: new Date().toISOString(),
  };

  const initialNames = ['Bosco', 'Alice', 'Jean', 'Diane', 'Patrick'];
  const fixedTokens = [
    'bosco-token-77a1',
    'alice-token-99b2',
    'jean-token-33c3',
    'diane-token-44d4',
    'patrick-token-55e5',
  ];

  initialNames.forEach((name, idx) => {
    const id = `part_vjn_${idx + 1}`;
    db.participants[id] = {
      id,
      eventId: demoEventId,
      name,
      secretToken: fixedTokens[idx],
      joinedAt: new Date(Date.now() - (5 - idx) * 3600000).toISOString(),
    };
  });

  db.assignments[demoEventId] = [];
  saveDb();
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    } else {
      seedInitialData();
    }
  } catch (err) {
    console.error('Error loading db, seeding fallback:', err);
    seedInitialData();
  }
}

loadDb();

// Secret Santa Derangement Algorithm (Sattolo)
export function generateSecretSantaDerangement(participants: Participant[]): Assignment[] {
  const n = participants.length;
  if (n < 3) {
    throw new Error('Secret Santa requires at least 3 participants for an anonymous exchange');
  }

  const pool = [...participants];

  // Sattolo algorithm: generates a uniform single cycle of length n
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // Strictly less than i
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  // Create assignments from cycle: pool[0] -> pool[1] -> ... -> pool[n-1] -> pool[0]
  const assignments: Assignment[] = [];
  for (let i = 0; i < n; i++) {
    const giver = pool[i];
    const receiver = pool[(i + 1) % n];

    if (giver.id === receiver.id) {
      throw new Error(`Critical derangement violation: ${giver.name} assigned to self`);
    }

    assignments.push({
      id: `asgn_${crypto.randomBytes(8).toString('hex')}`,
      eventId: giver.eventId,
      giverId: giver.id,
      receiverId: receiver.id,
      createdAt: new Date().toISOString(),
    });
  }

  return assignments;
}

const app = express();
app.use(express.json());

const api = express.Router();

// 1. Health check
api.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Create Event (Simple: Title, Organizer Name, Admin PIN)
api.post('/events', (req: Request, res: Response) => {
  try {
    const { title, organizerName, organizerEmail, adminPin, exchangeDate, location } = req.body;

    if (!title || !organizerName || !adminPin) {
      return res.status(400).json({ error: 'Title, Organizer Name, and 4-digit Admin PIN are required.' });
    }

    const code = generateEventCode(title);
    const eventId = `evt_${crypto.randomBytes(8).toString('hex')}`;

    const newEvent: SecretSantaEvent & { adminPinHash: string } = {
      id: eventId,
      code,
      title: title.trim(),
      organizerName: organizerName.trim(),
      organizerEmail: (organizerEmail || '').trim(),
      adminPinHash: hashPin(String(adminPin)),
      exchangeDate: exchangeDate || '',
      location: (location || '').trim(),
      status: 'REGISTRATION',
      revealIdentities: false,
      isRegistrationLocked: false,
      createdAt: new Date().toISOString(),
    };

    db.events[code] = newEvent;
    db.assignments[eventId] = [];
    saveDb();

    res.status(201).json({
      success: true,
      code,
      eventId,
      shareUrl: `/event/${code}`,
      title: newEvent.title,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// 3. Public event info
api.get('/events/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  if (!event) {
    return res.status(404).json({ error: 'Event not found. Please verify the code.' });
  }

  const participants = Object.values(db.participants).filter((p) => p.eventId === event.id);

  const publicInfo: PublicEventInfo = {
    code: event.code,
    title: event.title,
    organizerName: event.organizerName,
    exchangeDate: event.exchangeDate,
    location: event.location,
    status: event.status,
    revealIdentities: event.revealIdentities,
    isRegistrationLocked: event.isRegistrationLocked,
    participantCount: participants.length,
  };

  res.json(publicInfo);
});

// 4. Admin Login
api.post('/events/:code/admin/login', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const { pin } = req.body;
  const event = db.events[code];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (hashPin(String(pin)) !== event.adminPinHash) {
    return res.status(401).json({ error: 'Incorrect Admin PIN. Please try again.' });
  }

  const token = `adm_${crypto.createHash('sha256').update(code + event.adminPinHash).digest('hex').slice(0, 24)}`;
  res.json({ success: true, adminToken: token });
});

// Middleware for Admin validation
function verifyAdmin(req: Request, res: Response, next: () => void) {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const authHeader = req.headers.authorization;
  const pinHeader = req.headers['x-admin-pin'] as string;
  const expectedToken = `adm_${crypto.createHash('sha256').update(code + event.adminPinHash).digest('hex').slice(0, 24)}`;

  if (authHeader === `Bearer ${expectedToken}` || (pinHeader && hashPin(pinHeader) === event.adminPinHash)) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Admin authorization required' });
}

// 5. Admin Dashboard Data
api.get('/events/:code/admin', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  const participants = Object.values(db.participants).filter((p) => p.eventId === event.id);
  const assignments = db.assignments[event.id] || [];
  const assignedGivers = new Set(assignments.map((a) => a.giverId));

  const participantsWithStatus = participants.map((p) => ({
    ...p,
    hasDrawnAssignment: assignedGivers.has(p.id),
  }));

  const adminView: AdminEventView = {
    event: {
      id: event.id,
      code: event.code,
      title: event.title,
      organizerName: event.organizerName,
      organizerEmail: event.organizerEmail,
      exchangeDate: event.exchangeDate,
      location: event.location,
      status: event.status,
      revealIdentities: event.revealIdentities,
      isRegistrationLocked: event.isRegistrationLocked,
      createdAt: event.createdAt,
    },
    participants: participantsWithStatus,
    assignmentsCount: assignments.length,
  };

  res.json(adminView);
});

// 6. Admin Add Single Participant (Enter Name Only)
api.post('/events/:code/admin/participants', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Participant name is required' });
  }

  const id = `part_${crypto.randomBytes(6).toString('hex')}`;
  const newParticipant: Participant = {
    id,
    eventId: event.id,
    name: name.trim(),
    secretToken: generateToken(),
    joinedAt: new Date().toISOString(),
  };

  db.participants[id] = newParticipant;
  saveDb();
  res.status(201).json({ success: true, participant: newParticipant });
});

// 6b. Admin Batch Add Participants (Comma or line separated names)
api.post('/events/:code/admin/participants/batch', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  const { names } = req.body;

  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Array of names is required' });
  }

  const added: Participant[] = [];
  for (const raw of names) {
    const cleanName = String(raw).trim();
    if (!cleanName) continue;

    const id = `part_${crypto.randomBytes(6).toString('hex')}`;
    const newParticipant: Participant = {
      id,
      eventId: event.id,
      name: cleanName,
      secretToken: generateToken(),
      joinedAt: new Date().toISOString(),
    };
    db.participants[id] = newParticipant;
    added.push(newParticipant);
  }

  saveDb();
  res.status(201).json({ success: true, addedCount: added.length });
});

// 7. Admin Remove Participant
api.delete('/events/:code/admin/participants/:id', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  const { id } = req.params;

  if (!db.participants[id]) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  const assignments = db.assignments[event.id] || [];
  if (assignments.length > 0 && event.status !== 'REGISTRATION') {
    return res.status(400).json({
      error: 'Cannot remove participant after the draw has been conducted. Reset the draw first.',
    });
  }

  delete db.participants[id];
  saveDb();
  res.json({ success: true, message: 'Participant removed' });
});

// 8. Execute Secret Santa Draw
api.post('/events/:code/admin/draw', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];

  const currentAssignments = db.assignments[event.id] || [];
  if (currentAssignments.length > 0 && event.status !== 'REGISTRATION') {
    return res.status(400).json({
      error: 'The draw has already been performed. Reset the draw first if you need to reshuffle.',
    });
  }

  const participants = Object.values(db.participants).filter((p) => p.eventId === event.id);

  if (participants.length < 3) {
    return res.status(400).json({
      error: `Need at least 3 participants to perform the Secret Santa draw. Currently have ${participants.length}.`,
    });
  }

  try {
    const assignments = generateSecretSantaDerangement(participants);
    db.assignments[event.id] = assignments;
    event.status = 'DRAW_COMPLETED';
    event.isRegistrationLocked = true;
    saveDb();

    res.json({
      success: true,
      message: `Successfully drawn names for ${participants.length} participants with zero self-assignments!`,
      status: event.status,
      count: assignments.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to complete draw' });
  }
});

// 9. Reset Draw
api.post('/events/:code/admin/reset-draw', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];

  db.assignments[event.id] = [];
  event.status = 'REGISTRATION';
  event.isRegistrationLocked = false;
  event.revealIdentities = false;

  saveDb();
  res.json({ success: true, message: 'Draw reset successfully. Registration reopened.' });
});

// 10. Toggle Reveal Identities
api.post('/events/:code/admin/toggle-reveal', verifyAdmin, (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  event.revealIdentities = !event.revealIdentities;
  if (event.revealIdentities) {
    event.status = 'COMPLETED';
  }
  saveDb();
  res.json({ success: true, revealIdentities: event.revealIdentities, status: event.status });
});

// 11. Participant Registration (Enter Name Only!)
api.post('/events/:code/join', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const event = db.events[code];
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.isRegistrationLocked) {
    return res.status(400).json({ error: 'Registration is locked for this event because the draw has started.' });
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }

  // Check if participant with identical name already joined
  const existing = Object.values(db.participants).find(
    (p) => p.eventId === event.id && p.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (existing) {
    return res.status(200).json({
      success: true,
      alreadyJoined: true,
      participant: existing,
      secretUrl: `/event/${event.code}/my-secret/${existing.secretToken}`,
      message: `Welcome back, ${existing.name}! Here is your secret link.`,
    });
  }

  const id = `part_${crypto.randomBytes(6).toString('hex')}`;
  const secretToken = generateToken();

  const newParticipant: Participant = {
    id,
    eventId: event.id,
    name: name.trim(),
    secretToken,
    joinedAt: new Date().toISOString(),
  };

  db.participants[id] = newParticipant;
  saveDb();

  res.status(201).json({
    success: true,
    participant: newParticipant,
    secretUrl: `/event/${event.code}/my-secret/${secretToken}`,
    message: 'Wamaze kwinjira muri Kakawete!',
  });
});

// 12. Participant Secret View (Simple: Recipient Name Only)
api.get('/events/:code/participant/:token', (req: Request, res: Response) => {
  const code = (req.params.code || '').toUpperCase();
  const { token } = req.params;

  const event = db.events[code];
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const participant = Object.values(db.participants).find(
    (p) => p.eventId === event.id && p.secretToken === token
  );

  if (!participant) {
    return res.status(404).json({ error: 'Invalid secret link. Please request a new link from your organizer.' });
  }

  const assignments = db.assignments[event.id] || [];
  const myAssignment = assignments.find((a) => a.giverId === participant.id);

  let recipientData = undefined;
  if (myAssignment) {
    const recipient = db.participants[myAssignment.receiverId];
    if (recipient) {
      recipientData = {
        id: recipient.id,
        name: recipient.name,
      };
    }
  }

  let santaData = undefined;
  if (event.revealIdentities) {
    const whoBoughtForMe = assignments.find((a) => a.receiverId === participant.id);
    if (whoBoughtForMe) {
      const santa = db.participants[whoBoughtForMe.giverId];
      if (santa) {
        santaData = {
          name: santa.name,
        };
      }
    }
  }

  const view: ParticipantSecretView = {
    event: {
      code: event.code,
      title: event.title,
      organizerName: event.organizerName,
      exchangeDate: event.exchangeDate,
      location: event.location,
      status: event.status,
      revealIdentities: event.revealIdentities,
      isRegistrationLocked: event.isRegistrationLocked,
      participantCount: Object.values(db.participants).filter((p) => p.eventId === event.id).length,
    },
    me: {
      id: participant.id,
      name: participant.name,
      secretToken: participant.secretToken,
    },
    hasDrawn: Boolean(myAssignment),
    recipient: recipientData,
    mySanta: santaData,
  };

  res.json(view);
});

// 13. Reset to Demo seed
api.post('/demo/reset', (_req: Request, res: Response) => {
  seedInitialData();
  res.json({ success: true, message: 'Demo data reseeded' });
});

app.use('/api', api);

// Mount Vite or static serving
if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎁 Secret Santa Server running at http://0.0.0.0:${PORT}`);
});
