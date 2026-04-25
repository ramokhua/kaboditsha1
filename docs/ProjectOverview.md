# Project Overview

## 1. Introduction

KaboDitsha (Setswana: "Kabo" = allocation/giving, "Ditsha" = lands) is a comprehensive web-based land management system designed to revolutionize Botswana's land allocation process. The system replaces the current manual, paper-based process with a transparent, efficient, and accessible digital platform that serves all stakeholders—from individual citizens to land board administrators.

### 1.1 Background

Land is a fundamental resource for economic development, cultural identity, and social stability in Botswana. Land administration is managed by twelve Main Land Boards and their subordinate Land Boards, operating under the Ministry of Lands and Agriculture and governed by the Tribal Land Act (Cap 32:02). These Land Boards serve as the primary mechanism through which Batswana can obtain residential plots in cities, towns, villages, and agricultural land.

The current land allocation policy, revised in 2019, states that a citizen is eligible for one plot per settlement type—specifically one plot in a city, one in a town or village, and one farm plot. This policy ensures fair distribution and prevents multiple allocations. However, implementation remains heavily dependent on manual, paper-based processes that have persisted for decades.

Despite Botswana's Vision 2036 commitment to digital transformation and the government's broader e-governance initiatives, the land application and allocation process has not undergone significant modernization. This gap has led to inefficiencies, prolonged processing times, administrative backlogs, and limited transparency for applicants.

### 1.2 Problem Statement

The land allocation process in Botswana varies significantly across regions and involves a manual multi-step procedure that creates systemic inefficiencies:

#### 1.2.1 Accessibility Barriers

Applicants are required to obtain application forms from Land Board offices and pay the application fee of P50 in person. Submission methods vary by board—some accept only postal mail, others only hand delivery, while some accept both. This inconsistency creates immediate barriers for citizens without reliable transport or postal access.

#### 1.2.2 Manual Data Entry & Error-Prone Processing

Once received, application forms are manually processed by land board staff, who enter applicant details into digital waiting lists after cross-referencing against certified copies of Omang. The system is designed to prevent multiple allocations through the one-plot-per-settlement-type policy, but the verification process is manual and error-prone.

**Key Statistics:**
- 1.4 million applicants recorded across all land boards
- After vetting, only 500,000 applications were genuinely eligible
- **64% ineligibility rate** due to duplicates, already-allocated applicants, or unmet eligibility criteria
- At Bobonong Sub-Land Board, 200 plots were available for allocation, but over 1,000 interviewees were vetted—many turned away because they already had allocations elsewhere

#### 1.2.3 Prolonged Waiting Periods

Processing times vary dramatically by region, with waiting periods ranging from months to decades:

- **Bobonong Sub-Land Board:** 10,900 applicants on waiting list; still processing applications from 2005—a **17-year backlog**
- **Shashe West constituency:** Some residents applied in 1993/94 and only received allocations in 2022—**30-year wait**
- The Minister of Lands and Agriculture acknowledged "disturbing reports which involved citizens who applied for land 30 years ago still waiting"

#### 1.2.4 Opaque Communication

Throughout the waiting period, applicants have no means of tracking their applications in real time. To inquire about their position, they must either visit land board offices physically or attempt telephone contact—with no guarantee of calls being answered or receiving accurate information. This creates additional administrative burdens as staff spend significant time responding to these queries.

When decisions are finally made—whether for allocation, rejection, or duplicate detection—notifications are sent via postal mail, phone calls, or both, often after significant delays. These communication methods are unreliable as applicants may change addresses or phone numbers, resulting in missed updates.

#### 1.2.5 Legislative Mandate

The Digital Services Bill, 2025, recently passed by Parliament, now mandates that public bodies, including Land Boards, "develop accessible digital platforms for the provision of digital services." This legislative framework requires:

- Digital platforms accessible to citizens
- Online identity verification through a unique identifier
- Secure electronic payment mechanisms
- Compliance with national standards and interoperability protocols

### 1.3 Project Motivation

This project is motivated by a combination of personal experience, observed systemic inefficiencies, and alignment with national developmental priorities.

#### 1.3.1 Personal Experience

Having undergone the land application process personally, I experienced firsthand the frustrations of a non-transparent and manually driven system. After applying just before turning 18, I was informed two months later via phone call that my application was unsuccessful due to age eligibility—a delay that exposed the lack of real-time validation. Despite being placed on the waiting list after reapplying, I remained without any means to check my queue position other than calling or visiting offices in person. This exposure to physical access barriers highlighted the challenges Batswana face daily.

#### 1.3.2 Emerging Government Initiatives

During the course of this project, an emerging government portal (LAKYC) was identified, confirming that digitization efforts are underway. However, firsthand experience with this system revealed persistent gaps:
- A missing application that should have been automatically retrieved
- Interface friction where fields marked "optional" functionally blocked dashboard access until completed
- Unclear status tracking and messaging

These observations reinforce the need for a thoughtfully designed, integrated solution.

#### 1.3.3 National Alignment

Beyond addressing immediate inefficiencies, this project aligns with Botswana's Vision 2036, which emphasizes digital transformation, improved public service delivery, and inclusive development. The government's commitment to e-governance across all sectors, particularly the Digital Services Bill of 2025, classifies land boards as public bodies and legally mandates them to provide accessible electronic platforms for service delivery, accept digital submissions, issue approvals electronically, and maintain records in digital format.

### 1.4 Proposed Solution

KaboDitsha is a web-based platform that digitizes the entire land application lifecycle:

| Feature | Description |
|---------|-------------|
| **Online Applications** | Submit applications, upload documents, receive immediate confirmation |
| **Real-Time Tracking** | View waiting list position, receive email/in-app notifications |
| **Admin Dashboard** | Centralized management for Land Board staff to process applications, verify documents, update records |
| **Queue Management** | FIFO (First-In-First-Out) with auto-rebalancing on status changes |
| **Role-Based Dashboards** | Separate interfaces for Applicants, Staff, Managers, and Admins |
| **Analytics & Reporting** | Comprehensive charts, exportable reports for managers |
| **GPS-Powered Location** | Identify nearest Land Board, check proximity to essential services |
| **Smart Board Matcher** | Compare Land Boards by wait time and approval rate to make informed decisions |
| **Manager Audit Trail** | Complete log of all staff and manager actions within a region |

### 1.5 Project Objectives

| Objective | Status | Description |
|-----------|--------|-------------|
| **Digitize the Entire Process** | ✅ Complete | Enable citizens to apply online, upload documents, and receive immediate confirmation |
| **Implement Real-Time Tracking** | ✅ Complete | Allow applicants to log into a secure dashboard, view their position on the waiting list, and receive automatic updates via email and in-app notifications |
| **Develop Administration System** | ✅ Complete | Provide staff with tools to process applications, verify documents, update records, and communicate with applicants through a single interface |
| **Ensure Accessibility & Security** | ✅ Complete | Create an intuitive, mobile-responsive platform with JWT authentication and role-based access control |
| **Provide Decision Support** | ✅ Complete | Offer comparative analytics across Land Boards to help applicants make informed decisions about where to apply |

### 1.6 Project Scope

#### 1.6.1 In Scope

| Component | Status | Description |
|-----------|--------|-------------|
| **Public Homepage** | ✅ Complete | Waiting list statistics per Land Board, explanation of one-plot-per-settlement-type rule, eligibility criteria, application process overview |
| **Top 15 Boards Visualization** | ✅ Complete | Waiting list severity chart with percentile-based coloring (green → red) |
| **Smart Board Matcher** | ✅ Complete | GPS-powered recommendation tool comparing wait times and approval rates |
| **Application Trends Chart** | ✅ Complete | Monthly submission, approval, and pending trends with decision-making insights |
| **Settlement Performance Chart** | ✅ Complete | Approval rates and turnaround time by settlement type with purpose/region filters |
| **Public Web Portal** | ✅ Complete | Account creation, secure login, online application submission, document upload, queue position tracking, notifications |
| **Staff Dashboard** | ✅ Complete | Application review and processing, document verification, status updates, internal notes |
| **Manager Dashboard** | ✅ Complete | Analytics dashboard with application trends, status distribution, turnaround time, regional performance radar chart |
| **Manager Audit Trail** | ✅ Complete | Complete log of all staff and manager actions within a manager's region |
| **Admin Panel** | ✅ Complete | User management, land board management, system audit logs |
| **GPS Location Features** | ✅ Complete | Identify user's Land Board jurisdiction, check proximity to services |
| **User Authentication** | ✅ Complete | JWT-based authentication, session handling, role-based access control (4 roles) |
| **Document Management** | ✅ Complete | Upload, temporary storage (24-hour expiry), and verification of supporting documents |
| **Email Notifications** | ✅ Complete | Nodemailer integration for status updates and password reset |
| **In-App Notifications** | ✅ Complete | Bell icon with unread badge, real-time updates |
| **Password Reset** | ✅ Complete | Secure token-based password recovery |
| **Profile Management** | ✅ Complete | User profile editing and password change |

#### 1.6.2 Out of Scope

| Component | Reason |
|-----------|--------|
| Payment Gateway Integration | Cost considerations, academic project scope |
| AI Chatbot (Stretch Goal) | Time permitting, not a core requirement (documented as future enhancement) |
| Fully Automated Approvals | Legal requirements for human oversight |
| Integration with National Databases | Limited API availability, security concerns |
| Multi-Language Support | English is the official administrative language |
| SMS Notifications | Email and in-app are primary communication channels |

### 1.7 Key Statistics

| Metric | Value |
|--------|-------|
| Main Land Boards | 12 |
| Subordinate Land Boards | 39 |
| Seeded Users | ~60,000 |
| Seeded Applications | ~67,000 |
| User Roles | 4 (Applicant, Staff, Manager, Admin) |
| API Endpoints | 50+ |
| Database Tables | 11 |
| Lines of Code | ~25,000 |

---

## 2. System Overview

### 2.1 System Architecture

KaboDitsha follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                         │
│        React 18 + Vite + Tailwind CSS + Recharts           │
│                    (Web Browser Client)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                          │
│         Node.js + Express.js + JWT + Nodemailer             │
│              (Business Logic & API Gateway)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                              │
│         PostgreSQL + Prisma ORM + File System               │
│              (Database & Document Storage)                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 User Roles

| Role | Responsibilities |
|------|------------------|
| **Applicant** | Submit applications, track status, upload documents, withdraw applications |
| **Staff** | Review applications, verify documents, update statuses, add notes |
| **Manager** | Oversee region, view analytics, approve allocations, generate reports, view regional audit trail |
| **Admin** | Manage users, configure land boards, view system audit logs, broadcast notifications |

### 2.3 Core Workflows

#### 2.3.1 Application Submission Workflow

1. Applicant registers and logs in
2. Completes multi-step application form (Land Selection → Settlement Type → Document Upload → Review)
3. System validates one-plot-per-settlement-type policy
4. Application enters FIFO queue for selected Land Board
5. Applicant receives confirmation email with reference number
6. Applicant can track queue position in real-time ("47 of 15,250 applicants")

#### 2.3.2 Staff Review Workflow

1. Staff logs in and views assigned board's pending applications
2. Reviews application details and uploaded documents
3. Verifies documents (approve/reject with reason)
4. Updates application status (UNDER_REVIEW → DOCUMENTS_VERIFIED → APPROVED/REJECTED)
5. System auto-rebalances queue positions
6. Applicant receives email and in-app notification of status change

#### 2.3.3 Manager Analytics Workflow

1. Manager logs in and views regional analytics dashboard
2. Reviews application trends (submitted vs approved over time)
3. Analyzes status distribution to identify bottlenecks
4. Monitors turnaround time trends
5. Compares regional performance using radar chart
6. Exports PDF or Excel reports for stakeholders
7. Reviews audit trail of all staff actions in region

#### 2.3.4 Queue Management Workflow

1. Applications ordered by submission date (FIFO)
2. Queue position calculated automatically
3. When an application is approved/rejected, all subsequent positions rebalance
4. Real-time updates via 30-second polling
5. Display shows meaningful position: "47 of 15,250 applicants" with estimated wait time

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 4.5.0 | Build Tool |
| Tailwind CSS | 3.3.0 | Styling |
| React Router | 6.20.0 | Navigation |
| Axios | 1.6.0 | HTTP Client |
| Recharts | 2.10.0 | Charts & Visualizations |
| React-Leaflet | 4.2.1 | Maps & GPS |
| Lucide React | Latest | Icons |
| Framer Motion | Latest | Animations |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.11.0 | Runtime |
| Express.js | 4.18.0 | Web Framework |
| PostgreSQL | 15 | Database |
| Prisma | 5.22.0 | ORM |
| JWT | 9.0.0 | Authentication |
| bcrypt | 5.1.0 | Password Hashing |
| Multer | 1.4.5 | File Upload |
| Nodemailer | 6.9.0 | Email Service |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git/GitHub | Version Control |
| GitHub Codespaces | Cloud Development |
| Postman | API Testing |
| Prisma Studio | Database GUI |
| ESLint + Prettier | Code Quality |

---

## 4. Database Schema

### Core Models

```prisma
model User {
  userId        String    @id @default(cuid())
  userNumber    String    @unique // Format: US000001
  email         String    @unique
  password      String
  fullName      String
  omangNumber   Int       @unique // 9-digit Botswana ID
  phone         String?
  role          Role      @default(APPLICANT)
  landBoardId   String?   // Staff/Manager assignment
  applications  Application[]
  notifications Notification[]
}

model LandBoard {
  landBoardId   String    @id @default(cuid())
  boardNumber   String    @unique // MLB001 / SLB001
  name          String
  type          BoardType // MAIN or SUBORDINATE
  parentBoardId String?   // For subordinate boards
  region        String
  jurisdiction  String?
  officeAddress String?
  contactInfo   String?
  applications  Application[]
  waitingListStats WaitingListStat[]
  staff         User[]
}

model Application {
  applicationId   String    @id @default(cuid())
  applicationNumber String  @unique // APP2026000001
  referenceNumber String    @unique
  userId          String
  landBoardId     String
  settlementType  SettlementType // TOWN, VILLAGE, FARM
  status          ApplicationStatus
  queuePosition   Int?
  purpose         String?
  submittedAt     DateTime  @default(now())
}

model AuditLog {
  auditLogId String   @id @default(cuid())
  userId     String?
  action     String
  ipAddress  String?
  timestamp  DateTime @default(now())
  user       User?    @relation(fields: [userId], references: [userId])
}
```

### Database Statistics (Seeded at 10% Scale)

| Table | Record Count |
|-------|--------------|
| Users | ~60,000 |
| Applications | ~67,000 |
| Main Land Boards | 12 |
| Subordinate Land Boards | 39 |
| Waiting List Stats | 204 |
| Audit Logs | 500+ |
| Notifications | ~67,000 |
| Status History | ~67,000 |

---

## 5. Project Timeline

### 5.1 Alpha Milestone (Completed - March 11, 2026)

| Feature | Status |
|---------|--------|
| Database Schema Design | ✅ Complete |
| User Authentication | ✅ Complete |
| Land Board Data Seeding | ✅ Complete |
| Application Submission | ✅ Complete |
| Basic Queue Management | ✅ Complete |

### 5.2 Beta Milestone (Completed - April 14, 2026)

| Feature | Status |
|---------|--------|
| Document Upload | ✅ Complete |
| Notification System | ✅ Complete |
| Staff Dashboard | ✅ Complete |
| Manager Analytics | ✅ Complete |
| Admin Panel | ✅ Complete |
| Password Reset | ✅ Complete |
| Profile Edit | ✅ Complete |
| Manager Audit Trail | ✅ Complete |
| Smart Board Matcher | ✅ Complete |
| Waiting List Severity Chart | ✅ Complete |
| Settlement Performance Chart | ✅ Complete |
| Application Trends Chart | ✅ Complete |
| End-to-End Testing | ✅ Complete |

### 5.3 Final Release (Due April 27, 2026)

| Feature | Status |
|---------|--------|
| Documentation Completion | In Progress |
| Final Testing | In Progress |
| Deployment Verification | In Progress |

### 5.4 Future Enhancements (Post-Submission)

| Feature | Target |
|---------|--------|
| AI Chatbot Integration | Future |
| Mobile Application | Future |
| SMS Notifications | Future |
| Bulk Operations | Future |

---

## 6. Deployment

### 6.1 Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://kaboditsha.vercel.app |
| Backend API (Render) | https://kaboditsha-api.onrender.com |
| Health Check | https://kaboditsha-api.onrender.com/api/health |

### 6.2 Test Credentials

All passwords: **Password123**

| Role | Email | Region/Board |
|------|-------|--------------|
| **Admin** | admin0.6567@kaboditsha.gov.bw | System-wide |
| **Manager (Kgatleng)** | tumelo.montsho.manager2@landboard.gov.bw | Kgatleng |
| **Manager (Malete)** | kgosi.brown.manager5@landboard.gov.bw | Malete |
| **Staff (Kgatleng)** | lorato.kgafela.staff3@landboard.gov.bw | Kgatleng |
| **Staff (Malete)** | bontle.williams.staff7@landboard.gov.bw | Malete |
| **Applicant (Kgatleng)** | boitumelo.smith.0.8757@botswana.co.bw | Kgatleng |
| **Applicant (Malete)** | tshepo.molefe.4.6750@yahoo.com | Malete |

---

## 7. Conclusion

KaboDitsha represents a significant step toward modernizing Botswana's land administration system. By digitizing the entire application lifecycle—from submission through allocation—the system addresses critical pain points:

- **Accessibility:** Citizens can apply from anywhere, eliminating travel requirements
- **Transparency:** Real-time queue positions replace uncertain phone calls and office visits
- **Efficiency:** Automated queue management reduces administrative overhead
- **Accountability:** Complete audit trails ensure transparency at all levels
- **Data-Driven Decision Making:** Managers can identify bottlenecks and track performance trends

The system is now **feature-complete** for the Beta milestone, with all core functionality implemented and tested. The platform aligns with the Digital Services Bill 2025 requirements and Botswana's Vision 2036 digital transformation agenda.

---

**Last Updated:** April 25, 2026  
**Version:** 1.0.0-Beta (Complete)