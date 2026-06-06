# Vemtap Evangelism System Frontend Implementation Plan

This document outlines the step-by-step plan for building the frontend of the Vemtap Evangelism System. Since the backend is currently out of scope, we will heavily mock all data interactions (API calls, authentication, and state management) using React context or local storage to simulate a fully functional frontend.

## User Review Required

> [!IMPORTANT]  
> **Styling Approach:** The project currently has TailwindCSS installed in `package.json`. However, my core instructions recommend Vanilla CSS for maximum flexibility and rich aesthetics unless Tailwind is explicitly preferred. **Would you like me to proceed with TailwindCSS (v4 is installed) or stick to Vanilla CSS modules for building out the UI?**

## Open Questions

> [!WARNING]  
> 1. **Mock Data State:** Since we're mocking the backend, do you prefer using simple local state (`useState`/`useContext`) that resets on refresh, or should I persist the mocked data to `localStorage` so the flow feels more realistic during testing?
> 2. **Design Aesthetic:** I plan to use a highly premium, modern aesthetic with glassmorphism, subtle micro-animations, and dynamic interactions to make the dashboards feel alive. Is there a specific primary color or theme you want the base app to reflect before custom branding is applied?

---

## Proposed Changes

We will build the frontend in phases.

### Phase 1: Core Layout & Navigation Setup
Establish the base layouts for the different access levels and the public-facing pages.

#### [NEW] `app/layout.tsx` (Update)
- Include global fonts (e.g., Inter or Outfit).
- Set up a simulated AuthContext to mock the logged-in user role (Super Admin, Branch Admin, Worker, or Unauthenticated).

#### [NEW] `app/(dashboard)/layout.tsx`
- Build the main dashboard shell (sidebar navigation, top bar with user profile/branch info).
- Navigation items will dynamically render based on the active mocked role.

#### [NEW] `components/ui/*`
- Create base reusable UI components (Buttons, Inputs, Cards, Modals, Tables) with premium styling.

---

### Phase 2: Authentication & Onboarding (Mocked)
Build the login and initial setup flows.

#### [NEW] `app/login/page.tsx`
- Simple UI simulating OTP login.
- Dropdown to "select" which role you are logging in as (for testing purposes).

#### [NEW] `app/onboarding/page.tsx`
- Setup wizard for the HQ Super Admin to create the first church, add branches, and invite branch admins.

---

### Phase 3: Worker Flow (Evangelism Entry)
The core feature for workers to log their invites.

#### [NEW] `app/(dashboard)/worker/page.tsx`
- Worker dashboard showing personal stats: Invites Count, Attended Count, Conversion Rate.

#### [NEW] `app/(dashboard)/worker/add-invite/page.tsx`
- Form to add a new invitee (Name, Phone Number, Optional Note).
- Success animation upon submission.

#### [NEW] `app/(dashboard)/worker/invites/page.tsx`
- List/Table of all people the worker has invited, showing their status (Invited vs. Attended).

---

### Phase 4: First-Timer Flow (QR Code Public Form)
The public-facing page that visitors scan when they arrive at church.

#### [NEW] `app/f/[unique_code]/page.tsx`
- A clean, mobile-first, welcoming form for first-timers.
- Fields: Name, Phone, Email (optional), and an optional dropdown to select the worker who invited them.
- Success screen showing a warm welcome message.

---

### Phase 5: Dashboards (Branch Admin & Super Admin)
Data visualization and management for higher-level roles.

#### [NEW] `app/(dashboard)/hq/page.tsx`
- Super Admin Dashboard.
- High-level metrics: Total Invites, Total Attended across all branches.
- Branch performance comparison list/charts.

#### [NEW] `app/(dashboard)/branch/page.tsx`
- Branch Admin Dashboard.
- Metrics for the specific branch and a leaderboard of worker performance.

#### [NEW] `app/(dashboard)/manage-users/page.tsx`
- UI to add and manage workers (accessible by Branch/Super Admin).

---

### Phase 6: Messaging & Custom Domain Settings
Communication tools and white-labeling setup.

#### [NEW] `app/(dashboard)/messages/page.tsx`
- UI to compose and send SMS/Email to contacts.
- Display mock "Credit Balance" and a button to "Buy Credits".

#### [NEW] `app/(dashboard)/settings/domain/page.tsx`
- The step-by-step White-Label Onboarding UI Flow (as described in Section 15).
- Input domain -> Show DNS Instructions -> Verify -> Success Screen.

---

## Verification Plan

### Automated/Manual Verification
- I will verify the responsiveness and visual aesthetic of each component directly.
- I will ask you to review the mocked flows (e.g., logging in as a worker, adding an invite, and then filling out the first-timer form) to ensure the logic and UX perfectly align with the goal of tracking evangelism seamlessly.
