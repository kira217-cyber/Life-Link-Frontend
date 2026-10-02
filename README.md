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

## What each role gets

### Public

| Route           | What it is                                                              |
| --------------- | ----------------------------------------------------------------------- |
| `/`             | Landing page — the problem, the workflow, live platform figures         |
| `/how-it-works` | The three paths through the product, side by side                       |
| `/eligibility`  | An eligibility checker that answers before you register                 |
| `/about`        | Why the project exists and what it deliberately does not do             |
| `/contact`      | A validating form that is honest about having no inbox behind it        |
| `/login`        | Password sign-in, Google OAuth, and one-click demo accounts             |
| `/register`     | Role chosen at sign-up, because the whole workflow depends on it        |

### Donor

| Route               | What it is                                                           |
| ------------------- | -------------------------------------------------------------------- |
| `/donor`            | Invitations to donate, accept or decline                             |
| `/donor/donations`  | Donation history, with the cooldown counted from the last one        |
| `/donor/profile`    | Blood group, location, availability — the record matching runs on    |

### Requester

| Route                     | What it is                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `/requester`              | Own requests and the donors invited to each                    |
| `/requester/requests/new` | A three-step wizard: patient, hospital, timing                 |
| `/donors`                 | Searchable donor directory, filtered by group and distance     |

### Admin

| Route               | What it is                                                           |
| ------------------- | -------------------------------------------------------------------- |
| `/admin`            | Platform statistics, charted                                         |
| `/admin/requests`   | The review queue — nothing reaches a donor before it clears this     |
| `/admin/users`      | Every account, and the one switch that controls access               |
| `/admin/payments`   | The Stripe ledger, read-only                                         |
| `/admin/audit-logs` | Append-only trail of everything that happened                        |

### Shared

`/requests` (open requests), `/notifications`, `/profile` (account settings), `/donate` (Stripe
Checkout), `/payment/success`, `/payment/cancel`.

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
| Auth          | Backend JWTs held in httpOnly cookies + proxy       |
| Charts        | Recharts                                            |
| Icons & toast | Lucide React, Sonner                                |

---

## How the session works

The access token never reaches the browser. That one decision shapes most of the architecture.

**Tokens live in httpOnly cookies.** `ll_at` (15 minutes), `ll_rt` (7 days) and `ll_user` (the
display name and role, so a layout can greet someone without a round trip). None is readable from
client JavaScript, so an XSS payload cannot lift the session.

**Client components call a same-origin proxy.** They post to `/api/backend/…`; the route handler
reads the cookie on the server and forwards the call with the credential attached. No CORS, and no
token in a network tab.

**Access is checked three times.** The proxy refuses the request at the edge; the page re-checks
on the server before rendering; the API checks again and is the only one that actually matters.
The first two exist so nobody is shown a page they will then be thrown out of — not as the
security boundary.

Role areas are enforced in `src/proxy.ts` rather than in page components. A `redirect()` that runs
after a layout shell has already streamed degrades into a client-side navigation, which is visible
and feels broken.

> Next.js 16 renamed the `middleware` convention to `proxy`, which is why the file is `src/proxy.ts`.

---

## Design notes

**Warm, not clinical.** People reach for this on a bad day, so the palette is a warm cream ground
with a deep crimson accent rather than the usual greyscale dashboard chrome. The neutrals carry a
few degrees of the accent's hue so nothing sits at zero chroma.

**Semantic colour is separate from brand colour.** Urgency (normal / urgent / critical) and
outcome (success / warning / info) have their own tokens. A reader has to catch those at a glance,
so they must not shift if the brand accent ever does.

**The chart palette is colour-blind safe.** Five hues checked for deuteranopia, protanopia and
tritanopia, every pair at least ΔE 8 apart, lightness held inside a band so no series disappears
against the card in either theme.

**The artwork is drawn, not photographed.** Every illustration is inline SVG that takes its ink
from the theme, so it re-colours in dark mode, stays sharp at any size and costs no image request.
A stock photo of a needle is also the last thing a nervous first-time donor should meet.

**Server Components by default.** `"use client"` appears only where there is genuine
interactivity — the mobile nav sheet, the theme menu, forms and live data views.

**Every list has three states.** Loading is a skeleton shaped like the content that follows, not a
spinner. Empty says which empty it is — nothing yet, or filters that excluded everything. Error
offers a retry rather than a dead end.

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

## Deploying

The frontend is a standard Next.js deployment and needs no build configuration. Two things on the
**backend** have to be updated once the frontend has an address, because the API reads both from
its own environment rather than trusting the client:

```
STRIPE_SUCCESS_URL = https://<frontend>/payment/success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL  = https://<frontend>/payment/cancel
CORS_ORIGINS       = https://<frontend>
```

Miss those and checkout will complete but return the donor to the wrong place.

---

## Scripts

| Command         | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Development server on port 3000 |
| `npm run build` | Production build                |
| `npm start`     | Serve the production build      |
| `npm run lint`  | ESLint across the project       |

---

## Project layout

```
src/
  app/
    (public)/      landing, how it works, eligibility, about, contact, payment results
    (auth)/        login, register
    (dashboard)/   every signed-in route, one shell
    api/backend/   same-origin proxy to the API
  components/      one folder per feature, plus ui/ and shared/
  hooks/queries/   TanStack Query hooks, keys in one tree
  lib/
    api/           server, browser and proxy clients + the error envelope
    auth/          session cookies, server actions, route guards
    validation/    Zod schemas mirroring the API's own rules
    domain.ts      enum labels, compatibility chart, policy constants
  proxy.ts         edge auth and role routing
```
