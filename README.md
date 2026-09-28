# LifeLink — Frontend

The web client for **LifeLink**, a blood donation and emergency assistance platform. It consumes
the [LifeLink API](https://github.com/kira217-cyber/Life-Link-Backend) and gives each of the three
roles — donor, requester, admin — the workflow that belongs to them.

Built for **Programming Hero Apollo Level 2 — Batch 7, Assignment 7**.

|                   |                                                            |
| ----------------- | ---------------------------------------------------------- |
| **Live frontend** | _added after deployment_                                   |
| **Live API**      | https://life-link-api.vercel.app                           |
| **Backend repo**  | https://github.com/kira217-cyber/Life-Link-Backend         |
| **API docs**      | https://documenter.getpostman.com/view/57916709/2sBYAvupu5 |

---

## The problem

When a patient needs blood urgently, the search is still manual — phone calls, Facebook groups,
word of mouth. Three things go wrong every time.

1. **Compatibility gets guessed.** People ask for the same group and miss the donors who could
   actually help. An A+ patient can receive from O−, O+, A− and A+, not only A+.
2. **Nobody tracks who may donate.** Someone who gave blood three weeks ago should not be called
   again, and no informal channel remembers that.
3. **Requests go unverified.** An unmoderated post can send a dozen volunteers to a hospital
   nobody confirmed exists.

LifeLink turns the search into a workflow: a request is verified before anyone is contacted, then
matched against every compatible blood group, filtered by eligibility and distance, and the
donation is recorded when it happens.

---

## Tech stack

| Area          | Choice                                             |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19, TypeScript       |
| Styling       | Tailwind CSS v4 with CSS-variable design tokens     |
| Components    | shadcn/ui on Radix primitives                       |
| Server state  | TanStack Query                                      |
| Client state  | Zustand                                             |
| Forms         | React Hook Form + Zod                               |
| Auth          | Backend JWTs held in httpOnly cookies + middleware  |
| Charts        | Recharts                                            |
| Icons & toast | Lucide React, Sonner                                |

---

## Design notes

**Warm, not clinical.** People reach for this on a bad day, so the palette is a warm cream ground
with a deep crimson accent rather than the usual greyscale dashboard chrome. The neutrals carry a
few degrees of the accent's hue so nothing sits at zero chroma.

**Semantic colour is separate from brand colour.** Urgency (normal / urgent / critical) and
outcome (success / warning / info) have their own tokens. A reader has to catch those at a glance,
so they must not shift if the brand accent ever does.

**The artwork is drawn, not photographed.** Every illustration is inline SVG that takes its ink
from the theme, so it re-colours in dark mode, stays sharp at any size and costs no image request.
A stock photo of a needle is also the last thing a nervous first-time donor should meet.

**Server Components by default.** `"use client"` appears only where there is genuine
interactivity — the mobile nav sheet, the theme menu, forms and live data views.

---

## Running locally

Requires Node 20+.

```bash
git clone https://github.com/kira217-cyber/Life-Link-Frontend.git
cd Life-Link-Frontend
npm install

cp .env.example .env.local
# fill in the API URL and the demo account credentials

npm run dev
```

Open http://localhost:3000.

### Environment

| Variable                    | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`  | Backend API base, e.g. `https://…/api/v1`        |
| `NEXT_PUBLIC_API_ROOT_URL`  | Backend root, for the health check               |
| `NEXT_PUBLIC_SITE_URL`      | This site's own origin, used for metadata        |
| `DEMO_*_EMAIL` / `PASSWORD` | The three demo accounts behind one-click sign-in |

The demo passwords are deliberately **not** `NEXT_PUBLIC_`. They are read by a server action, so
they never reach the browser bundle.

---

## Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Development server on port 3000 |
| `npm run build` | Production build                |
| `npm start`     | Serve the production build      |
| `npm run lint`  | ESLint across the project       |

---

## Status

Day 1 of five: project setup, the design system, the public shell and the landing page.
Authentication, the three dashboards, payments and deployment follow.
