# 🎁 Secret Santa - Simple Name-Only Gift Exchange

A simple, modern, mobile-first web application for organizing an anonymous **Secret Santa gift exchange** for a private group.

---

## 🌟 Simple & Clean Concept

1. **Create Group**: The organizer enters an event name (e.g., "Family Secret Santa" or "VJN Staff") and sets a 4-digit PIN.
2. **Enter Names Only**:
   - Participants join by simply typing their **Full Name**.
   - The organizer can also quickly type or paste a list of names (e.g. `Bosco, Alice, Jean, Diane, Patrick`).
   - No budgets, no wishlists, no forms to fill out.
3. **Anonymous Derangement Draw**:
   - The organizer clicks **🎲 DRAW SECRET SANTA**.
   - The system pairs everyone randomly using **Sattolo's Algorithm** (ensuring no one gets themselves and every person gives and receives exactly one gift).
4. **Private Secret Assignments**:
   - Each participant opens their private link (`/event/:code/my-secret/:token`) to reveal:
     > **Hello Bosco!**  
     > **You are the Secret Santa for: ✨ ALICE ✨**  
     > **🤫 Keep it secret!**

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Canvas Confetti.
- **Backend**: Express, Node.js (Vite dev server mode).
- **Database**: Relational schema provided in `database.sql`.
- **Persistence**: File & memory backing in `data/secret_santa_db.json`.

---

## 🚀 Running the App

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🧪 Demo Event

- **Event Code**: `VJN-XMAS-8K4P`
- **Organizer PIN**: `1234`
- **Participants**: Bosco, Alice, Jean, Diane, Patrick
