# Manage Organization API – Full Reference

This document is the canonical reference for every endpoint added by the
Manage Organization feature. For each endpoint it covers:

- The HTTP method, path, and required roles
- A short narrative of what the endpoint does
- Path, query, and body parameters with their TypeScript-style shapes
- The success response shape
- Every error code and status the endpoint can return

## Table of contents

1. [Conventions](#conventions)
2. [Locations](#1-locations)
3. [Teams](#2-teams)
4. [Members](#3-members)
5. [Forms](#4-forms)
6. [Public form surface](#5-public-form-surface)
7. [Jobs](#6-jobs)
8. [Appendix: system tables, mocked services, deferred work](#appendix)

---

## Conventions

### Base URLs

| Surface | Base | Auth |
|---|---|---|
| Admin | `https://<host>/api` | Bearer access token |
| Public | `https://<host>/f` | None, unless `distribution.mode = registered\|private` |

### Required headers

| Header | Value | Applies to |
|---|---|---|
| `Authorization` | `Bearer <access_token>` | All `/api/*` routes |
| `Content-Type` | `application/json` | All write routes |

### Roles
- `super_admin` – unrestricted
- `organization_admin` – unrestricted within the caller's organization
- `location_admin` (alias `branch_admin`) – restricted to the caller's location
- `worker` – no manage-org access

### Error envelope

Every non-2xx response is shaped as:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "team_ids must not be empty" },
  "statusCode": 400,
  "timestamp": "2026-06-06T10:00:00.000Z",
  "path": "/api/locations/loc_abc/members"
}
```

Default `code` values for each HTTP status:

| Status | Code |
|---|---|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHENTICATED` |
| 402 | `INSUFFICIENT_CREDITS` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 413 | `PAYLOAD_TOO_LARGE` |
| 422 | `UNPROCESSABLE_ENTITY` |
| 423 | `LOCKED` |
| 429 | `RATE_LIMITED` |
| 5xx | `INTERNAL_ERROR` |

Endpoints may override `code` with a more specific value (e.g. `CONFLICT`,
`REGISTRATION_REQUIRED`, `VALIDATION_ERROR`).

### Pagination

List endpoints accept `?page=1&per_page=50` and reply with:

```json
{
  "data": [ … ],
  "meta": { "page": 1, "per_page": 50, "total": 137 }
}
```

`per_page` is capped at 100. The page is 1-indexed. The maximum page size
varies per endpoint and is noted next to the DTO.

### Photo uploads

The frontend uploads photos directly to the CDN and sends the resulting URL to
the backend. There is no multipart endpoint. The backend validates the URL is
well-formed and on the configured CDN allowlist (see
`StorageService.resolvePhotoUrl`).

### Throttling

A global `AppThrottlerGuard` (in-memory store) is applied. Per-endpoint
`@SkipThrottle()` exemptions exist for the public form surface
(`GET /f/:publicId`, `POST /f/:publicId/track`) and for any handler decorated
with `@ThrottleOverride(...)`.

---

## 1. Locations

Resource: `Location` – a single physical site within an organization
(e.g. "HQ Downtown", "Southpark Satellite"). Every organization has exactly
one `is_hq` location.

---

### `GET /api/locations`

List locations visible to the caller.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Query parameters

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `q` | `string` | no | – | Case-insensitive prefix on name or city |
| `status` | `'active' \| 'paused' \| 'archived'` | no | – | – |
| `page` | `int ≥ 1` | no | `1` | – |
| `per_page` | `int 1..100` | no | `20` | – |

#### Response — 200

```json
{
  "data": [
    {
      "id": "loc_01HXY…",
      "organization_id": "org_01HXY…",
      "name": "HQ Downtown",
      "address": "12 Redemption Way",
      "city": "Lagos",
      "state": "Lagos",
      "country": "NG",
      "description": "A small satellite for youth outreach.",
      "photo_url": "https://cdn.vangly.app/.../photo.webp",
      "is_hq": true,
      "status": "active",
      "activity": "High",
      "stats": {
        "teams": 4,
        "members": 145,
        "submissions_30d": 87
      },
      "created_at": "2025-11-01T09:12:00.000Z",
      "updated_at": "2025-11-01T09:12:00.000Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 1 }
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/locations`

Create a new location in the caller's organization.

- **Roles**: `organization_admin`, `super_admin`
- **Auth**: Bearer required

#### Request body — `CreateLocationDto`

```ts
interface CreateLocationDto {
  name: string;            // 1-200 chars, trimmed
  city: string;            // 1-100 chars
  state?: string;          // 1-100 chars
  country: string;         // ISO 3166-1 alpha-2 (e.g. "NG")
  address?: string;        // ≤ 500 chars
  description?: string;    // ≤ 500 chars
  photo_url?: string;      // ≤ 2000 chars
}
```

#### Response — 201

Returns the new location in the same shape as `GET /api/locations` data
items.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, bad `country` |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is not org/super admin |
| 409 | `CONFLICT` | A location with the same `name` already exists in the org |
| 429 | `RATE_LIMITED` | Throttled |

> The first location created in a brand-new org is auto-flagged `is_hq = true`.
> Subsequent locations get `is_hq = false`.

---

### `GET /api/locations/:id`

Fetch a single location.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | The location id |

#### Response — 200

Same shape as one item in `GET /api/locations` data.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `PATCH /api/locations/:id`

Update any subset of location fields.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | The location id |

#### Request body — `UpdateLocationDto`

```ts
interface UpdateLocationDto {
  name?: string;           // 1-200
  city?: string;           // 1-100
  state?: string;          // 1-100
  country?: string;        // ISO 3166-1 alpha-2
  address?: string;        // ≤ 500
  description?: string;    // ≤ 500
  photo_url?: string;      // ≤ 2000
  status?: 'active' | 'paused' | 'archived';
}
```

All fields are optional; only the ones present are updated.

#### Response — 200

Same shape as one item in `GET /api/locations` data.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad `country` or invalid value |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 409 | `CONFLICT` | New name collides with another location in the org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `DELETE /api/locations/:id`

Soft-delete (archive) a location.

- **Roles**: `organization_admin`, `super_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | The location id |

#### Response — 200

```json
{ "ok": true }
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is not org/super admin, **or** the location is the org's HQ (`is_hq = true`) |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

> HQ locations cannot be archived. Merge or remove the org first.

---

### `POST /api/locations/:id/photo`

Replace the location's photo by URL. The frontend uploads to the CDN, then
calls this endpoint with the resulting URL.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | The location id |

#### Request body — `LocationPhotoDto`

```ts
interface LocationPhotoDto {
  photo_url: string;   // valid URL, ≤ 2000 chars
}
```

#### Response — 200

```json
{ "photo_url": "https://cdn.vangly.app/.../photo.webp" }
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad URL, host not on CDN allowlist |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/locations/:id/dashboard`

Return the dashboard payload for a location. Three tabs; the `tab` query
parameter switches between them.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | The location id |

#### Query parameters — `LocationDashboardQueryDto`

```ts
interface LocationDashboardQueryDto {
  tab: 'performance' | 'teams' | 'settings';   // default: 'performance'
  timeframe?: 'week' | 'month' | 'year';       // performance tab only
}
```

#### Response — 200 (discriminated by `tab`)

`tab = 'performance'`:

```ts
interface PerformanceTabEntity {
  stats: Array<{
    label: string;          // e.g. 'Active Members'
    value: number | string; // e.g. 145
    meta?: string;          // optional caption
    change_pct?: number;    // optional % change vs prior period
    is_up: boolean;
  }>;
  attendance: {
    timeframe: 'week' | 'month' | 'year';
    buckets: Array<{ label: string; value: number }>;
  };
  milestones: Array<{
    label: string;
    value: string;
    date: string;           // ISO date
    icon: 'calendar' | 'users' | 'target';
  }>;
}
```

`tab = 'teams'`:

```ts
interface TeamsTabEntity {
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    kind: 'admin' | 'operational' | 'outreach' | 'custom';
    is_public_joinable: boolean;
    allow_member_pin: boolean;
    sms_otp_required: boolean;
    member_count: number;
    form_count: number;
    preview_members: Array<{ id: string; name: string }>;
  }>;
}
```

`tab = 'settings'`:

```ts
interface SettingsTabEntity {
  status: 'active' | 'paused' | 'archived';
  primary_admin?: { id: string; name: string } | null;
  security_protocol: string;   // human-readable summary
  created_at: string;          // ISO date
}
```

The envelope around these is:

```ts
interface LocationDashboardEntity {
  tab: 'performance' | 'teams' | 'settings';
  data: PerformanceTabEntity | TeamsTabEntity | SettingsTabEntity;
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `tab` or `timeframe` not in the allowed enum |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

> The performance tab uses a raw SQL query for attendance bucketing and a
> 2-query pattern for team/inviter aggregation. There is no N+1.

---

## 2. Teams

Resource: `Team` – a grouping of members (and forms) within a location. Two
system teams are auto-created in every location: `Admin` (read-only,
undeletable) and `General` (the fallback target for forms detached from
deleted teams).

---

### `POST /api/locations/:locationId/teams`

Create a team in the specified location.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Request body — `CreateTeamDto`

```ts
interface CreateTeamDto {
  name: string;                 // 1-100, trimmed
  description?: string;         // ≤ 500
  is_public_joinable?: boolean; // default false
  allow_member_pin?: boolean;   // default false; if true, members must have a PIN
}
```

#### Response — 201

```ts
interface TeamEntity {
  id: string;
  organization_id: string;
  location_id: string;
  name: string;
  description?: string;
  kind: 'admin' | 'operational' | 'outreach' | 'custom';
  is_public_joinable: boolean;
  allow_member_pin: boolean;
  sms_otp_required: boolean;
  member_count: number;
  form_count: number;
  created_at: string;
  updated_at: string;
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Empty name, name too long |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 409 | `CONFLICT` | A team with the same `name` already exists in the location, **or** the name is the reserved string `Admin` |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/locations/:locationId/teams`

List teams in a location.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Query parameters — `FindTeamsQueryDto`

```ts
interface FindTeamsQueryDto {
  q?: string;                                                 // search by name
  team_id?: string;
  kind?: 'admin' | 'operational' | 'outreach' | 'custom';
  page?: number;                                              // default 1
  per_page?: number;                                          // default 50, max 100
}
```

#### Response — 200

```json
{ "data": [ /* TeamEntity */ ], "meta": { "page": 1, "per_page": 50, "total": 7 } }
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No location with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/locations/:locationId/teams/:teamId`

Team detail with members and forms.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |
| `teamId` | `string` | The team id |

#### Query parameters
| Field | Type | Notes |
|---|---|---|
| `q` | `string` | Filter members by name/phone/email |
| `page` | `int ≥ 1` | Default `1` |
| `per_page` | `int 1..100` | Default `50` |

#### Response — 200

```ts
interface TeamDetailEntity {
  team: TeamEntity;
  members: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    status: 'active' | 'inactive' | 'suspended';
    roles: string[];        // team names this user belongs to
    team_admins: string[];  // team names where this user is a team admin
    invites_count: number;
    is_team_admin: boolean; // admin status within *this* team
    created_at: string;
  }>;
  forms: Array<{
    id: string;
    public_id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    field_count: number;
    scans: number;
    submissions: number;
    updated_at: string;
  }>;
  meta: { page: number; per_page: number; total: number };
}
```

The team-admin lookup uses a 2-query pattern (filtered `teamMembership.findMany`
on the membership table) to avoid N+1.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No team/location with those ids in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `PATCH /api/teams/:teamId`

Update a team's name, description, or join flags.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `teamId` | `string` | The team id |

#### Request body — `UpdateTeamDto`

```ts
interface UpdateTeamDto {
  name?: string;
  description?: string;
  is_public_joinable?: boolean;
  allow_member_pin?: boolean;
}
```

#### Response — 200

`TeamEntity` shape.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad name or description |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the team's location, **or** the team is the system `Admin` team (read-only) |
| 404 | `NOT_FOUND` | No team with that id in the caller's org |
| 409 | `CONFLICT` | New name collides with another team in the same location, **or** the new name is the reserved string `Admin` |
| 429 | `RATE_LIMITED` | Throttled |

---

### `DELETE /api/teams/:teamId`

Delete a team. Any forms bound to it are detached and reassigned to the
location's system `General` team (within the same transaction).

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `teamId` | `string` | The team id |

#### Response — 200

```json
{ "ok": true }
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the team's location, **or** the team is the system `Admin` team |
| 404 | `NOT_FOUND` | No team with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/teams/:teamId/clone-from`

Clone a team from another location in the same organization. The `:teamId` in
the URL is the *destination* team (ignored for the clone itself).

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `teamId` | `string` | The destination team id (the source is in the body) |

#### Request body — `CloneTeamDto`

```ts
interface CloneTeamDto {
  source_location_id: string;     // must belong to the same org
  source_team_name: string;       // 1-100
  import_members?: boolean;       // default false
  import_forms?: boolean;         // default false
}
```

#### Response — 201

```ts
interface CloneTeamResultEntity {
  team: TeamEntity;
  imported_members: number;
  imported_forms: number;
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Empty source team name, source location not in the org |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the destination location |
| 404 | `NOT_FOUND` | Source location/team not found |
| 409 | `CONFLICT` | A team with the same name already exists at the destination location |
| 429 | `RATE_LIMITED` | Throttled |

---

## 3. Members

Resource: `User` with `role = 'worker'` and at least one `TeamMembership` in
the caller's organization. Members are always scoped to a single
`branch_id` (location). A user can be a member of multiple teams.

---

### `GET /api/locations/:locationId/members`

List members of a location.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Query parameters — `FindMembersQueryDto`

```ts
interface FindMembersQueryDto {
  q?: string;                                          // name/phone/email
  team_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  page?: number;                                       // default 1
  per_page?: number;                                   // default 50, max 100
}
```

#### Response — 200

```ts
{
  data: Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    status: 'active' | 'inactive' | 'suspended';
    roles: string[];            // team names this user belongs to
    team_admins: string[];      // team names where this user is a team admin
    invites_count: number;
    created_at: string;         // ISO
  }>;
  meta: { page: number; per_page: number; total: number };
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/locations/:locationId/members`

Add a member to the location. If the phone is already known to the platform
in this org/location, the user is reused; otherwise a new `User` is created
and a mocked "Welcome" SMS is dispatched (best-effort).

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Request body — `CreateMemberDto`

```ts
interface CreateMemberDto {
  name: string;                                    // 1-200
  phone: string;                                   // E.164
  email?: string;                                  // ≤ 254
  pin?: string;                                    // 4-6 digits; required if any team has allow_member_pin=true
  team_ids: string[];                              // ≥ 1, all in this location
  status?: 'active' | 'inactive' | 'suspended';   // default 'active'
  is_team_admin?: string[];                        // subset of team_ids
  assign_forms?: string[];                         // optional form ids
}
```

#### Response — 201

`MemberEntity` shape (single object).

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, empty `team_ids`, `is_team_admin` not a subset of `team_ids`, `pin` required but missing, `pin` in history |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | Location not found in the caller's org |
| 409 | `CONFLICT` | Phone already registered in another org, or already registered in a different location of this org |
| 429 | `RATE_LIMITED` | Throttled |
| 402 | `INSUFFICIENT_CREDITS` | The location's `sms_credits` is 0 and the welcome SMS could not be sent (warning logged, not blocking) |

---

### `GET /api/members/:memberId`

Fetch a single member by id.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Response — 200

`MemberEntity` shape.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the member's location |
| 404 | `NOT_FOUND` | No member with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `PATCH /api/members/:memberId`

Update a member's name, phone, email, status, team-admin flags, or PIN.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Request body — `UpdateMemberDto`

```ts
interface UpdateMemberDto {
  name?: string;
  phone?: string;                          // E.164
  email?: string;
  status?: 'active' | 'inactive' | 'suspended';
  is_team_admin?: string[];                // replaces the admin set
  pin?: string;                            // 4-6 digits; not in pin_history
}
```

#### Response — 200

`MemberEntity` shape.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, `pin` fails policy |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the member's location |
| 404 | `NOT_FOUND` | No member with that id in the caller's org |
| 409 | `CONFLICT` | New phone collides with another member |
| 429 | `RATE_LIMITED` | Throttled |

---

### `DELETE /api/members/:memberId?location_id=…`

Remove a member from a location. The user is detached from all team
memberships at that location; if they have no remaining memberships, their
`status` is set to `inactive` (the user row is **not** deleted).

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Query parameters
| Field | Type | Required | Notes |
|---|---|---|---|
| `location_id` | `string` | **yes** | The location to remove the member from |

#### Response — 200

```json
{ "ok": true }
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `location_id` missing |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | No member with that id at that location in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/members/:memberId/transfer`

Move a member to a different location and (optionally) to a different set of
teams. The member's old memberships are removed in the same transaction.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Request body — `TransferMemberDto`

```ts
interface TransferMemberDto {
  to_location_id: string;       // must belong to the caller's org
  to_team_ids: string[];         // ≥ 1, all in the target location
  is_team_admin?: string[];      // subset of to_team_ids
}
```

#### Response — 200

`MemberEntity` shape.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad `to_location_id`, `to_team_ids` not in that location |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the target location |
| 404 | `NOT_FOUND` | Member not found in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/members/:memberId/reset-pin`

Start an admin-initiated PIN reset. A 6-digit OTP is generated and sent to
the member's phone via the mocked SMS service. The OTP is kept in an
in-memory map keyed by member id, valid for 10 minutes.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Response — 200

```json
{ "otp_expires_in": 600 }
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No member with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |
| 402 | `INSUFFICIENT_CREDITS` | The location's `sms_credits` is 0 (warning logged) |

---

### `POST /api/members/:memberId/reset-pin/verify`

Verify the OTP and set a new PIN. The PIN is checked against the 5-entry
history and rejected if reused.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `memberId` | `string` | The user id |

#### Request body — `ResetPinRequestDto`

```ts
interface ResetPinRequestDto {
  otp: string;          // 6 digits, from the previous /reset-pin call
  pin: string;          // 4-6 digits, not in pin_history
}
```

#### Response — 200

```json
{ "ok": true }
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `otp` or `pin` missing, OTP invalid or expired, `pin` in history |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No member with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/locations/:locationId/members/bulk-import`

Queue a bulk import. Returns a `job_id`; the frontend polls
`GET /api/jobs/:jobId` for progress.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Request body — `BulkImportDto`

```ts
interface BulkImportRowDto {
  name: string;            // 1-200
  phone: string;           // E.164
  email?: string;
  role?: string;           // free-form, ≤ 100
}

interface BulkImportDto {
  team_id: string;                                       // must be in this location
  default_status?: 'active' | 'inactive';                // default 'active'
  rows: BulkImportRowDto[];                              // ≤ a few hundred
}
```

The job handler iterates `rows` in batches of 25, updating the `Job` row
periodically with `processed`/`succeeded`/`failed` counts. Failures are
appended to `Job.errors[]` as `{ row, message }` pairs (1-indexed). The
final `Job` row will have `status = 'done'` or `'failed'`.

#### Response — 202

```json
{ "job_id": "job_01HXY…", "queued": 142 }
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, bad row |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 404 | `NOT_FOUND` | `team_id` not found in this location |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/locations/:locationId/members/export`

Download the member list as CSV. Columns: `Name`, `Role`, `Phone`, `Email`.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `locationId` | `string` | The location id |

#### Response — 200

`Content-Type: text/csv; charset=utf-8`
`Content-Disposition: attachment; filename="members.csv"`

```csv
Name,Role,Phone,Email
"Jane Member","Ushers","+2348012345678","jane@example.com"
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to this location |
| 429 | `RATE_LIMITED` | Throttled |

---

## 4. Forms

Resource: `Form` – a collectable form that members of the public fill in
through a public URL. Has a 9-character `public_id` for the QR code, plus
`status = draft | published | archived`. The first published version's
fields are kept as a `FormVersion` snapshot whenever the form is edited
while published.

### Field types

`text`, `multiline`, `number`, `email`, `phone`, `rating`,
`single_choice`, `multi_choice`, `dropdown`, `date`, `signature`, `photo`,
`barcode`, `address`.

---

### `POST /api/teams/:teamId/forms`

Create a draft form for a team.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `teamId` | `string` | The team id (overrides any `team_id` in the body) |

#### Request body — `CreateFormDto`

```ts
interface CreateFormDto {
  title: string;                          // 1-200
  description?: string;                   // ≤ 2000
  team_id: string;                        // (overridden by path param)
  fields: FormFieldDto[];                 // ≥ 1
  distribution?: FormDistributionDto;
}

interface FormFieldOptionDto {
  value: string;        // 1-100
  label: string;        // 1-200
}

interface FormFieldValidationDto {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;     // ≤ 400
}

interface FormFieldDto {
  key: string;                              // 1-100, unique per form
  label: string;                            // 1-200
  type?: FormFieldType;                     // see enum above
  required?: boolean;
  placeholder?: string;                     // ≤ 1000
  help_text?: string;                       // ≤ 2000
  options?: FormFieldOptionDto[];           // for choice/dropdown
  validation?: FormFieldValidationDto;
  meta?: Record<string, unknown>;
}

interface FormDistributionDto {
  mode?: 'public' | 'registered' | 'private';   // default 'public'
  frequency?: 'all' | 'one_per_user' | 'unlimited';
  open_at?: string;                              // ISO date
  close_at?: string;                             // ISO date
  send_sms_invites?: boolean;
  sms_message?: string;                          // ≤ 2000
}
```

The backend allocates a 9-character `public_id` from a 53-char alphabet that
drops ambiguous glyphs (`0`, `O`, `o`, `I`, `l`, `1`). Collisions retry up
to 5 times.

#### Response — 201

```ts
interface FormEntity {
  id: string;
  public_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  fields: FormFieldDto[];
  distribution: FormDistributionDto;
  schema_version: number;             // starts at 1
  analytics_scans: number;            // starts at 0
  analytics_submissions: number;      // starts at 0
  team_id: string;
  location_id: string;
  created_at: string;
  published_at?: string;
  updated_at: string;
  public_url: string;                 // e.g. "https://vangly.app/f/AbCdEfGhi"
  qr_payload: string;                 // same as public_url
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Empty `fields`, duplicate `key`, bad `type` |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the team's location |
| 404 | `NOT_FOUND` | Team not found in the caller's org |
| 409 | `CONFLICT` | Could not allocate a unique `public_id` after 5 attempts |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/teams/:teamId/forms`

List forms for a team.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `teamId` | `string` | The team id |

#### Query parameters — `FindFormsQueryDto`

```ts
interface FindFormsQueryDto {
  team_id?: string;
  status?: 'draft' | 'published' | 'archived';
  q?: string;            // title or description
  page?: number;         // default 1
  per_page?: number;     // default 50, max 100
}
```

#### Response — 200

`{ data: FormEntity[], meta: { page, per_page, total } }`

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Caller is a `location_admin` not bound to the team's location |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/forms/:formId`

Fetch a single form.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Response — 200

`FormEntity` shape.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `PATCH /api/forms/:formId`

Update a form. If `fields` is provided **and** the form is currently
`published`, the current fields are snapshotted to `FormVersion` and
`schema_version` is bumped.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Request body — `UpdateFormDto`

```ts
interface UpdateFormDto {
  title?: string;
  description?: string;
  fields?: FormFieldDto[];        // see CreateFormDto
  distribution?: FormDistributionDto;
}
```

#### Response — 200

`FormEntity` shape (with the new `schema_version` if bumped).

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cannot update an archived form, bad `fields`/`distribution` |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/forms/:formId/publish`

Move a form to `status = 'published'`. Must have at least one field.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Response — 200

`FormEntity` shape with `status = 'published'` and `published_at` set.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | No fields defined, form is archived |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/forms/:formId/archive`

Move a form to `status = 'archived'`. Archived forms cannot be updated.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Response — 200

`FormEntity` shape with `status = 'archived'`.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/forms/:formId/duplicate`

Duplicate a form in the same team/location. The copy starts as a fresh
`draft` with `schema_version = 1`, title suffixed with `(copy)`.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id to copy |

#### Response — 201

`FormEntity` shape of the new form.

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `POST /api/forms/:formId/clone`

Clone a form into a different team (cross-location). The target team must be
in the caller's org but **not** in the same location as the source.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id to clone |

#### Request body — `CloneFormDto`

```ts
interface CloneFormDto {
  target_team_id: string;       // in caller's org, in a different location
  new_title?: string;           // ≤ 200; defaults to the source title
}
```

#### Response — 201

`FormEntity` shape of the cloned form.

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `target_team_id` not in the caller's org |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Target team is in the same location as the source |
| 404 | `NOT_FOUND` | Source form not found in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/forms/:formId/versions`

List the version snapshots taken before each published-form edit.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Response — 200

```ts
Array<{
  id: string;
  form_id: string;
  schema_version: number;
  archived_at: string;     // ISO
}>
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/forms/:formId/responses`

List responses for a form, newest first.

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Query parameters
| Field | Type | Notes |
|---|---|---|
| `page` | `string` (numeric) | Default `1` |
| `per_page` | `string` (numeric) | Default `50`, max 100 |

#### Response — 200

```ts
{
  data: Array<{
    id: string;
    form_id: string;
    form_schema_version: number;
    submitted_at: string;
    submitted_by?: string;
    answers: Record<string, unknown>;
  }>;
  meta: { page: number; per_page: number; total: number };
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

### `GET /api/forms/:formId/responses/export`

Download responses as CSV. The header row is `submitted_at, submitted_by, …`
followed by one column per form field (the `label`).

- **Roles**: `organization_admin`, `super_admin`, `location_admin`
- **Auth**: Bearer required

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `formId` | `string` | The form id |

#### Response — 200

`Content-Type: text/csv; charset=utf-8`
`Content-Disposition: attachment; filename="form-{formId}-responses.csv"`

```csv
submitted_at,submitted_by,Full name,Email
2026-06-06T10:00:00.000Z,,Jane Doe,jane@example.com
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 404 | `NOT_FOUND` | No form with that id in the caller's org |
| 429 | `RATE_LIMITED` | Throttled |

---

## 5. Public form surface

The `/f/*` surface is what QR codes and shared links point at. It is
unauthenticated by default; if a form has `distribution.mode = registered` or
`private`, the caller must also be signed in.

> The global `AppThrottlerGuard` is exempted on the public `GET` and
> `POST /track` (so QR scans and short-lived poll traffic don't burn the
> limit). `POST /f/:publicId` (the actual submit) is still rate-limited.

---

### `GET /f/:publicId`

Fetch a published form (including the brand kit) for rendering on a public
form page.

- **Auth**: None, unless `distribution.mode = registered|private`

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `publicId` | `string` | The 9-char form id |

#### Response — 200

```ts
interface PublicFormEntity {
  public_id: string;
  title: string;
  description?: string;
  organization_name: string;
  location_name: string;
  logo_url?: string;
  primary_color?: string;       // hex
  fields: FormFieldDto[];
  distribution: FormDistributionDto;
  schema_version: number;
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 404 | `NOT_FOUND` | No form with that public id |
| 403 | `FORBIDDEN` | Form is not currently `published` |
| 403 | `REGISTRATION_REQUIRED` | `distribution.mode = registered` and caller is not signed in |

---

### `POST /f/:publicId/track`

Called when a QR is first opened. Records a scan and returns a short-lived
`scan_token` (in-memory, 5-minute TTL, single-use) the frontend should pass
back on the eventual submit.

- **Auth**: None
- **Throttler**: skipped

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `publicId` | `string` | The 9-char form id |

#### Request body — `TrackScanDto`

```ts
interface TrackScanDto {
  scan_token?: string;     // free-form ref echoed for debugging (≤ 64)
}
```

#### Response — 201

```ts
interface PublicScanEntity {
  scan_token: string;      // 32 hex chars
  public_id: string;
  form_id: string;         // internal id (use public_id on the wire)
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Form is not currently `published` |
| 404 | `NOT_FOUND` | No form with that public id |

---

### `POST /f/:publicId`

Submit answers to a published form. The `scan_token` (from `/track`) is
validated and consumed. Submissions atomically increment
`Form.analytics_submissions` and write a `FormResponse` row.

If `distribution.send_sms_invites = true` and `sms_message` is set, a
mocked SMS is dispatched (best-effort) and an `SmsAuditLog` row is written.

- **Auth**: None, unless `distribution.mode = registered|private` (in which
  case `user_id` or a session is required)

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `publicId` | `string` | The 9-char form id |

#### Request body — `PublicSubmitDto`

```ts
interface PublicSubmitDto {
  answers: Record<string, unknown>;   // keyed by FormField.key
  scan_token?: string;                // required if /track was called
  user_id?: string;                   // when distribution.mode=registered|private
}
```

`answers` validation (in `FormsService.validateSubmission`):

- `required` fields must be present (non-null, non-empty string)
- `type`-specific format: `email` is RFC-ish, `phone` is E.164, `number`
  matches `^-?\d+(\.\d+)?$`, `rating` is `0..5`, `date` is parseable,
  `photo` is a URL
- `single_choice` / `multi_choice` / `dropdown` answers must be one of
  `FormFieldOption.value`
- extra keys in `answers` are rejected

#### Response — 201

```ts
interface PublicSubmitResultEntity {
  response_id: string;
  submitted_at: string;   // ISO
  message?: string;       // e.g. "Thanks for your response!"
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing required answer, bad type, unknown field |
| 400 | `VALIDATION_ERROR` | `scan_token` invalid or expired |
| 403 | `FORBIDDEN` | Form is not currently `published` |
| 403 | `REGISTRATION_REQUIRED` | `distribution.mode = registered|private` and no `user_id`/session |
| 404 | `NOT_FOUND` | No form with that public id |
| 429 | `RATE_LIMITED` | Throttled |

---

## 6. Jobs

The job queue is in-memory (production TODO: BullMQ). It supports a single
kind today: `members_bulk_import`. The frontend polls
`GET /api/jobs/:jobId` for progress.

### Job state machine

```
queued  ──►  running  ──►  done
                     └──►  failed
```

### `GET /api/jobs/:jobId`

Get the status and progress of a background job.

- **Auth**: Bearer required; cross-org access is forbidden.

#### Path parameters
| Field | Type | Notes |
|---|---|---|
| `jobId` | `string` | The job id (from the original enqueue response) |

#### Response — 200

```ts
interface JobView {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;   // only present if any errors
  kind: 'members_bulk_import';
  started_at?: string;
  finished_at?: string;
  created_at: string;
}
```

#### Errors

| Status | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Job belongs to a different organization |
| 404 | `NOT_FOUND` | No job with that id |
| 429 | `RATE_LIMITED` | Throttled |

#### Polling pattern

```ts
async function waitForJob(jobId: string, token: string) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`/api/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const job = await res.json();
    if (job.status === 'done' || job.status === 'failed') return job;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('timeout');
}
```

---

## Appendix

### System tables and seeded rows

| Table | Seeded on | Notes |
|---|---|---|
| `Team` (`Admin`) | every new `Location` | read-only, undeletable, every org_admin is auto-added |
| `Team` (`General`) | every new `Location` | fallback target for forms detached from deleted teams |
| `User` (super_admin) | `db.seedSuperAdmin()` | called from the auth spec's `beforeEach` |

### Mocked services (TODO: replace in prod)

- **`SmsService.send({ to, template, vars, organizationId, locationId, body })`**
  - Checks `Location.sms_credits`; if 0 throws `402 INSUFFICIENT_CREDITS`.
  - Decrements `sms_credits` by 1 and writes an `SmsAuditLog` row
    (`status = 'mocked'`, `credits_after` set).
- **`JobsService.enqueue(kind, orgId, locationId, payload)`**
  - Writes a `Job` row with `status = 'queued'` and dispatches the registered
    handler on the next tick (`setImmediate`).
- **`StorageService.resolvePhotoUrl({ photo_url })`**
  - Validates the URL is `https://` and the host is on the configured CDN
    allowlist (from `CORS_ORIGINS`).
- **`ScanTokenStore`** (in `PublicFormsService`)
  - In-memory `Map<token, { publicId, expiresAt }>`. 5-minute TTL, single-use.
  - **TODO**: replace with Redis.

### Deferred features

- **Redis** for throttler storage, jobs, and scan-token store
- **BullMQ** for durable job execution
- **Twilio / Africa's-Talking** for real SMS delivery
- **argon2id** for PIN hashing (currently sha256)
- **XLSX** bulk import (CSV-only today)
- **Multipart** photo upload (CDN-direct today)
- **Refresh-token cookie** rotation per-device

### Cross-cutting `.agent` rules followed

- DTOs: one per file, `!:` on required, `@Type` explicit, `whitelist + forbidNonWhitelisted`
- Entities: `@Exclude()` / `@Expose()`, `@ApiProperty` everywhere
- No N+1: `select` (no default `include`), 2-query pattern for unbounded
  relations, `$queryRaw` for the dashboard's time-bucketed aggregation
- Soft delete on `Location`; transactional re-attach for `Form` on
  `Team` delete
- Env-driven secrets (`JWT_ACCESS_SECRET` ≥ 32 chars); boot aborts if missing
- Helmet, Throttler, Pino, Swagger wired in `main.ts` / `app.module.ts`
- Migrations via `prisma migrate dev` with descriptive names; `prisma generate`
  re-run after schema changes

### Quick-reference: every endpoint

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/locations` | Bearer |
| `POST` | `/api/locations` | Bearer |
| `GET` | `/api/locations/:id` | Bearer |
| `PATCH` | `/api/locations/:id` | Bearer |
| `DELETE` | `/api/locations/:id` | Bearer |
| `POST` | `/api/locations/:id/photo` | Bearer |
| `GET` | `/api/locations/:id/dashboard` | Bearer |
| `POST` | `/api/locations/:locationId/teams` | Bearer |
| `GET` | `/api/locations/:locationId/teams` | Bearer |
| `GET` | `/api/locations/:locationId/teams/:teamId` | Bearer |
| `PATCH` | `/api/teams/:teamId` | Bearer |
| `DELETE` | `/api/teams/:teamId` | Bearer |
| `POST` | `/api/teams/:teamId/clone-from` | Bearer |
| `GET` | `/api/locations/:locationId/members` | Bearer |
| `POST` | `/api/locations/:locationId/members` | Bearer |
| `GET` | `/api/members/:memberId` | Bearer |
| `PATCH` | `/api/members/:memberId` | Bearer |
| `DELETE` | `/api/members/:memberId` | Bearer |
| `POST` | `/api/members/:memberId/transfer` | Bearer |
| `POST` | `/api/members/:memberId/reset-pin` | Bearer |
| `POST` | `/api/members/:memberId/reset-pin/verify` | Bearer |
| `POST` | `/api/locations/:locationId/members/bulk-import` | Bearer |
| `GET` | `/api/locations/:locationId/members/export` | Bearer |
| `POST` | `/api/teams/:teamId/forms` | Bearer |
| `GET` | `/api/teams/:teamId/forms` | Bearer |
| `GET` | `/api/forms/:formId` | Bearer |
| `PATCH` | `/api/forms/:formId` | Bearer |
| `POST` | `/api/forms/:formId/publish` | Bearer |
| `POST` | `/api/forms/:formId/archive` | Bearer |
| `POST` | `/api/forms/:formId/duplicate` | Bearer |
| `POST` | `/api/forms/:formId/clone` | Bearer |
| `GET` | `/api/forms/:formId/versions` | Bearer |
| `GET` | `/api/forms/:formId/responses` | Bearer |
| `GET` | `/api/forms/:formId/responses/export` | Bearer |
| `GET` | `/f/:publicId` | Optional |
| `POST` | `/f/:publicId/track` | None |
| `POST` | `/f/:publicId` | Optional |
| `GET` | `/api/jobs/:jobId` | Bearer |
