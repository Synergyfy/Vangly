# Vemtap Evangelism System — Developer Implementation Guide (With Branch + Roles)

This is the updated full guide including:
- Multi-branch system
- Role-based access control
- Clean schema + APIs

---

# 1. SYSTEM OVERVIEW

Structure:
Church → Branch → Worker → Invitee

Users:
1. Super Admin (HQ)
2. Branch Admin
3. Worker

---

# 2. DATABASE STRUCTURE (UPDATED)

## 2.1 Churches Table
- id
- name
- subdomain
- logo_url
- primary_color
- created_at

---

## 2.2 Branches Table
- id
- church_id
- name
- location (optional)
- created_at

---

## 2.3 Users Table (Unified for all roles)

- id
- church_id
- branch_id (nullable for HQ Admin)
- name
- phone_number (unique)
- role (super_admin / branch_admin / worker)
- department (optional)
- created_at

---

## 2.4 Invitees Table

- id
- church_id
- branch_id
- worker_id
- name
- phone_number
- note (optional)
- status (invited / attended)
- created_at

---

## 2.5 FirstTimers Table

- id
- church_id
- branch_id
- name
- phone_number
- email (optional)
- selected_worker_id (optional)
- matched_worker_id (optional)
- created_at

---

## 2.6 QR Codes Table

- id
- church_id
- branch_id
- type (first_timer)
- unique_code
- url
- created_at

---

# 3. ROLE PERMISSIONS

## Super Admin (HQ)
- Full access to all branches
- Manage branches
- View all data
- Send messages to all

## Branch Admin
- Access only their branch
- Manage workers in branch
- View branch data
- Send messages within branch

## Worker
- Add invites
- View own contacts
- Send messages to own contacts

---

# 4. AUTHENTICATION (OTP)

POST /auth/send-otp
POST /auth/verify-otp

Return:
- user_id
- role
- church_id
- branch_id

---

# 5. BRANCH MANAGEMENT APIs

## Create Branch (Super Admin only)
POST /branches

Input:
- name
- location

---

## Get Branches
GET /branches

Filter:
- By church_id

---

# 6. USER MANAGEMENT APIs

## Create User
POST /users

Input:
- name
- phone_number
- role
- branch_id (required for branch_admin & worker)

---

## Get Users
GET /users

Filter:
- role
- branch_id

---

# 7. INVITE SYSTEM APIs

## Add Invite
POST /invites

Input:
- name
- phone_number
- worker_id

Logic:
- Auto attach church_id + branch_id from worker
- Prevent duplicates

---

## Get Invites (Role-Based)
GET /invites

Logic:
- Super Admin → all
- Branch Admin → filter by branch_id
- Worker → filter by worker_id

---

# 8. FIRST TIMER FLOW (UPDATED WITH BRANCH)

## QR Structure (Per Branch)

/f/{unique_code}

Each QR is tied to:
- church_id
- branch_id

---

## Submit First Timer
POST /first-timer

Input:
- name
- phone
- email
- selected_worker_id (optional)

---

## Matching Logic

1. Match phone in Invitees
2. If found:
   - assign worker_id
   - assign branch_id from invite
3. Else:
   - use selected_worker_id
4. Else:
   - keep unmatched

---

## Update Invite
- status = attended

---

# 9. DASHBOARD APIs

## Super Admin Dashboard
GET /dashboard/hq

Returns:
- total_invites
- total_attended
- per_branch_stats

---

## Branch Dashboard
GET /dashboard/branch

Returns:
- branch_invites
- branch_attended
- workers_performance

---

## Worker Dashboard
GET /dashboard/worker

Returns:
- invites_count
- attended_count
- conversion_rate

---

# 10. MESSAGING SYSTEM (SMS + EMAIL + CREDITS)

## 10.1 Credit System (IMPORTANT)

Each church must have a **wallet/credit balance** for messaging.

### Add Table: Wallets
- id
- church_id
- sms_credits (integer)
- email_credits (integer)
- created_at

---

### Add Table: Transactions
- id
- church_id
- type (sms_purchase / email_purchase / usage)
- amount
- units (number of credits)
- created_at

---

## 10.2 Buy Credits Flow

Frontend:
- "Buy SMS Credits"
- "Buy Email Credits"

Backend:
POST /payments/buy-credits

Input:
- type (sms/email)
- amount

Process:
- Integrate payment gateway (Paystack/Flutterwave)
- On success:
  - Increase wallet balance
  - Save transaction

---

## 10.3 Send SMS

POST /messages/sms

Input:
- message
- recipient_ids OR phone_numbers

Logic:
- Count recipients
- Check if enough sms_credits
- Deduct credits
- Send via SMS provider

---

## 10.4 Send Email

POST /messages/email

Input:
- subject
- message
- recipient_emails

Logic:
- Check email_credits
- Deduct credits
- Send via email service (SendGrid/Mailgun)

---

## 10.5 Role Restrictions

- Super Admin → can send to all
- Branch Admin → branch only
- Worker → own contacts only

---

# 11. WHITE-LABEL DOMAIN SYSTEM (IMPORTANT)

## 11.1 Purpose

Allow churches to use their own domain instead of invitely.com

Example:
- connect.mychurch.com

---

## 11.2 Add Field to Churches Table

- custom_domain (nullable)

---

## 11.3 Domain Setup Flow

Step 1:
Church enters domain in dashboard

Step 2:
System shows DNS instruction:
- Add CNAME → point to your server (e.g. app.invitely.com)

Step 3:
System verifies domain

Step 4:
Activate domain

---

## 11.4 Backend Logic

On every request:

1. Read request host (domain)
2. Check:
   - If matches custom_domain → load that church
   - Else → use subdomain logic

---

## 11.5 SSL (IMPORTANT)

- Automatically generate SSL (Let's Encrypt)

---

## 11.6 URL Behavior

Without white-label:
- rccg.invitely.com

With white-label:
- connect.rccg.org

---

## 11.7 QR Code with White-label

If custom domain exists:
- Use it in QR

Example:
- connect.rccg.org/f/wuse2

Else:
- use invitely domain

---

# 12. SECURITY RULES

Every query must include:
- church_id filter

Branch Admin:
- enforce branch_id

Worker:
- enforce worker_id

---

# 12. QR SYSTEM (BRANCH-AWARE)

Each branch has its own QR

Example:
- invitely.com/f/rccg-wuse2

Backend:
- resolve code → church_id + branch_id

---

# 13. ONBOARDING FLOW

1. Create church
2. Create branches
3. Assign Super Admin
4. Create branch admins
5. Add workers
6. Generate QR per branch

---

# 14. TESTING CHECKLIST (UPDATED)

Test:
- Branch creation
- Role restrictions
- Invite flow per branch
- QR per branch works
- Matching logic correct
- Dashboards per role correct

---

# 15. WHITE-LABEL ONBOARDING UI FLOW (STEP-BY-STEP)

This explains exactly what the church admin will see when setting up their custom domain.

---

## STEP 1: Access Settings

Navigation:
- Dashboard → Settings → Custom Domain

Screen Title:
"Use Your Own Domain"

Description:
"Connect your church domain so members see your brand instead of Invitely"

---

## STEP 2: Enter Domain

Input Field:
- Custom Domain (e.g. connect.mychurch.com)

CTA Button:
- [Continue]

Validation:
- Must be a valid domain format

---

## STEP 3: DNS Instructions Screen

After clicking Continue:

Show:

"To connect your domain, please add the following DNS record"

Table:
- Type: CNAME
- Name/Host: connect
- Value: app.invitely.com

Extra Info:
"Login to your domain provider (e.g. GoDaddy, Namecheap) and add this record"

CTA:
- [I have added this]

---

## STEP 4: Verification Process

When user clicks "I have added this":

System runs check:
- Verify CNAME is correctly pointing

If NOT verified:
- Show message:
"Still verifying... this may take a few minutes"
- Retry button

If verified:
- Proceed to next step

---

## STEP 5: SSL Setup (Automatic)

Screen shows:
"Securing your domain..."

Process:
- Generate SSL certificate (Let's Encrypt)

Once done:
- Show success

---

## STEP 6: Success Screen

Message:
"🎉 Your domain is now connected!"

Display:
- Your new link: https://connect.mychurch.com

CTA:
- [Open My Site]

---

## STEP 7: QR Code Update

System automatically:
- Updates QR code links to use custom domain

Example:
- Old: invitely.com/f/wuse2
- New: connect.mychurch.com/f/wuse2

---

## STEP 8: Branding Confirmation (Optional UI Step)

Prompt user:
"Would you like to update your branding?"

Fields:
- Upload logo
- Choose primary color

CTA:
- Save

---

## STEP 9: Domain Status Panel

Inside Settings page:

Show:
- Domain: connect.mychurch.com
- Status: Active ✅

Actions:
- Edit domain
- Remove domain

---

## UX NOTES

- Keep instructions very simple
- Avoid technical language
- Add copy button for DNS values
- Add short help video (optional later)

---

# FINAL NOTE

Keep it simple.

Do not add more roles.
Do not overcomplicate permissions.

Focus:
Church → Branch → Worker → Invite → Attend → Match → Message

