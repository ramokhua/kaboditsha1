# KaboDitsha: Land Management System for Botswana

<div align="center">
  <img src="./frontend/src/kaboditshaLogo.png" alt="KaboDitsha Logo" width="200"/>
  <h3>Your Digital Path to Land Allocation</h3>
  <p>Modernizing Botswana's Land Administration Through Digital Innovation</p>
</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [Features](#-features)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Seeding the Database](#-seeding-the-database)
- [Testing Credentials](#-testing-credentials)
- [Project Status](#-project-status)
- [Roadmap](#-roadmap)
- [Documentation](#-documentation)
- [License](#-license)
- [Contact](#-contact)

---

## 📋 Project Overview

**KaboDitsha** (Setswana: "Kabo" = giving/allocation, "Ditsha" = lands) is a comprehensive web-based land management system designed to revolutionize Botswana's land allocation process. The system replaces the current manual, paper-based process with a transparent, efficient, and accessible digital platform.

### Core Statistics

| Metric | Value |
|--------|-------|
| Main Land Boards | 12 |
| Subordinate Land Boards | 39 |
| Seeded Users | ~60,000 |
| Seeded Applications | ~67,000 |
| User Roles | 4 (Applicant, Staff, Manager, Admin) |
| API Endpoints | 50+ |
| Database Tables | 11 |

---

## 🎯 Problem Statement

Land allocation in Botswana is managed through twelve Main Land Boards and their subordinate Land Boards, all overseen by the Ministry of Lands and Agriculture. The current system faces critical challenges:

### 1. Manual Application Process
- Applicants must obtain paper forms in person at Land Board offices
- Submission methods vary by board (postal mail only, hand delivery only, or both)
- Creates immediate accessibility barriers for citizens without transport or postal access

### 2. Manual Data Entry & Errors
- Staff manually enter applicant details into digital waiting lists
- Cross-referencing against Omang numbers is manual and error-prone
- **64% ineligibility rate** after vetting (Botswana Daily News, 2022)
- 1.4 million applicants recorded, only 500,000 genuinely eligible

### 3. Prolonged Waiting Periods
- Processing times range from months to over a decade
- **17-year backlog** at Bobonong Sub-Land Board (applications dating to 2005)
- Some applicants have passed away while still waiting for allocation

### 4. Opaque Communication
- No real-time tracking for applicants
- Must call or visit offices to check position
- Notifications sent via postal mail or phone calls with significant delays

---

## 💡 Solution

KaboDitsha addresses these challenges through a modern digital platform:

### Core Features

| Feature | Description |
|---------|-------------|
| **Online Applications** | Submit applications, upload documents, receive immediate confirmation |
| **Real-Time Tracking** | View waiting list position, receive email/in-app notifications |
| **Staff Dashboard** | Review applications, verify documents, update statuses |
| **Manager Analytics** | Regional performance charts, exportable reports, audit trail |
| **Admin Panel** | User management, land board configuration, system audit logs |
| **Queue Management** | FIFO (First-In-First-Out) with auto-rebalancing |
| **Smart Board Matcher** | GPS-powered comparison of wait times and approval rates |
| **Waiting List Severity** | Top 15 boards with percentile-based coloring (green → red) |

### Key Benefits

- ✅ **Transparency**: Real-time queue positions with "X of Y" format
- ✅ **Efficiency**: Auto-rebalancing queue positions on status changes
- ✅ **Accessibility**: Apply from anywhere, anytime
- ✅ **Accountability**: Complete audit trail of all actions
- ✅ **Data-Driven**: Analytics and reporting for informed decision-making

---

## 🏗️ System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                        │
│  React 18 + Vite + Tailwind CSS + Recharts + React-Leaflet │
│                    (Web Browser Client)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                         │
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

---

## 🛠️ Technology Stack

### Frontend

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

### Backend

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

### Development Tools

| Tool | Purpose |
|------|---------|
| Git/GitHub | Version Control |
| GitHub Codespaces | Cloud Development |
| Postman | API Testing |
| Prisma Studio | Database GUI |
| ESLint + Prettier | Code Quality |

---

## 🗄️ Database Schema

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

## ✨ Features

### Completed Features

| Category | Features | Status |
|----------|----------|--------|
| **Authentication** | Register, Login, JWT, Role-based Access, Password Reset | ✅ |
| **Queue Management** | FIFO Ordering, Auto-rebalancing, Real-time Updates (30s polling) | ✅ |
| **Application** | Multi-step Form, Document Upload, Withdrawal | ✅ |
| **Notifications** | In-app Bell, Email Alerts, Broadcast | ✅ |
| **Staff** | Review Applications, Verify Documents, Status Updates, Internal Notes | ✅ |
| **Manager** | Regional Analytics, Performance Charts, PDF/Excel Export, Audit Trail | ✅ |
| **Admin** | User Management, Land Board Management, System Audit Logs | ✅ |
| **Public** | Top 15 Boards (percentile-based), Smart Board Matcher, Gender Distribution | ✅ |
| **Visualizations** | Application Trends, Settlement Performance (with purpose/region filters) | ✅ |

---

## 👥 User Roles & Permissions

| Feature | Applicant | Staff | Manager | Admin |
|---------|-----------|-------|---------|-------|
| **Apply for Land** | ✅ | ❌ | ❌ | ❌ |
| **View Own Applications** | ✅ | ✅ | ✅ | ✅ |
| **Upload Documents** | ✅ | ❌ | ❌ | ❌ |
| **Queue Position** | ✅ | ✅ | ✅ | ✅ |
| **Review Applications** | ❌ | ✅ | ✅ | ✅ |
| **Verify Documents** | ❌ | ✅ | ✅ | ✅ |
| **Update Status** | ❌ | ✅ | ✅ | ✅ |
| **Region Statistics** | ❌ | ❌ | ✅ | ✅ |
| **Analytics Dashboard** | ❌ | ❌ | ✅ | ✅ |
| **Region Audit Trail** | ❌ | ❌ | ✅ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ✅ |
| **Land Board Management** | ❌ | ❌ | ❌ | ✅ |
| **System Audit Logs** | ❌ | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications/my` | Get user's applications |
| POST | `/api/applications` | Create new application |
| GET | `/api/applications/:id` | Get application details |
| PUT | `/api/applications/:id/status` | Update status |
| POST | `/api/applications/:id/documents` | Upload document |

### Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/applications` | Board applications |
| PUT | `/api/staff/applications/:id/status` | Update status |
| PUT | `/api/staff/documents/:id/verify` | Verify document |

### Manager
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manager/stats` | Region statistics |
| GET | `/api/manager/performance` | Analytics data |
| GET | `/api/manager/audit-logs` | Region audit trail |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/landboards` | List land boards |
| GET | `/api/admin/audit-logs` | Get audit logs |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/landboards` | Get all land boards |
| GET | `/api/waiting-list/stats` | Waiting list statistics |
| GET | `/api/applications/stats/gender` | Gender distribution |
| GET | `/api/applications/trends` | Application volume trends |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/ramokhua/kaboditsha.git
cd kaboditsha
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/kaboditsha"
# JWT_SECRET="your-super-secret-key"
# JWT_EXPIRE="7d"
# EMAIL_USER="kaboditsha.lms@gmail.com"
# EMAIL_PASS="your-gmail-app-password"
# FRONTEND_URL="http://localhost:5173"
```

#### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000/api
```

---

## 🌱 Seeding the Database

Run seed scripts in the following order (each script must complete before running the next):

```bash
cd backend

# 1. Create Land Boards (12 Main + 39 Subordinate)
node prisma/seed-1-boards.js

# 2. Create Staff, Managers, and Admins
node prisma/seed-2-users.js

# 3. Create Applicants and Applications (~60,000 users, ~67,000 applications)
node prisma/seed-3-applications.js

# 4. Add Historical Data (turnaround time data for last 12 months)
node prisma/seed-historical-data.js

# 5. Populate Supporting Tables (WaitingListStat, StatusHistory, Notifications)
node prisma/seed-5-supporting-data.js

# 6. Create Audit Logs (historical audit trail)
node prisma/seed-6-audit-logs.js
```

**Note:** 
- `seed-3-applications.js` takes approximately 2-3 minutes to complete
- All scripts use batch processing for performance (500 records per batch)
- At 10% scale, total applications will be ~60,000-67,000

### Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |
| Prisma Studio | `npx prisma studio` (run in backend folder) |

---

## 🔑 Testing Credentials

All passwords: **Password123**

| Role | Email | Region/Board |
|------|-------|--------------|
| **Admin** | `admin0@kaboditsha.gov.bw` | System-wide |
| **Manager (Kgatleng)** | `manager.kgatlenglandboard@landboard.gov.bw` | Kgatleng |
| **Manager (Malete)** | `manager.maletelandboard@landboard.gov.bw` | Malete |
| **Staff (Kgatleng)** | `staff.kgatlenglandboard@landboard.gov.bw` | Kgatleng |
| **Staff (Malete)** | `staff.maletelandboard@landboard.gov.bw` | Malete |
| **Applicant (Kgatleng)** | please see from the prisma database | Kgatleng |
| **Applicant (Malete)** | please see from the prisma database | Malete |

---

## 📊 Project Status

### Beta Milestone (Complete - April 14, 2026)

| Feature | Status |
|---------|--------|
| Document Upload | ✅ Complete |
| Notification System | ✅ Complete |
| Staff Dashboard | ✅ Complete |
| Manager Analytics | ✅ Complete |
| Admin Panel | ✅ Complete |
| Password Reset | ✅ Complete |
| Profile Edit | ✅ Complete |
| Smart Board Matcher | ✅ Complete |
| Waiting List Severity Chart | ✅ Complete |
| Settlement Performance Chart | ✅ Complete |
| Application Trends Chart | ✅ Complete |
| Manager Audit Trail | ✅ Complete |

### Final Release (Due April 27, 2026)

| Feature | Status |
|---------|--------|
| Documentation | In Progress |
| Final Testing | In Progress |

---

## 🗺️ Roadmap

### Post-Submission Enhancements

- [ ] AI Chatbot integration (Llama 3.2 with RAG)
- [ ] Mobile application (React Native)
- [ ] SMS notifications
- [ ] Bulk operations for staff
- [ ] PWA for offline access

---

## 📚 Documentation

### Project Reports
- [Detailed Proposal](./docs/KaboDitsha%20Detailed%20Proposal.pdf)
- [API Documentation](./docs/API.md)

### User Manuals (PDF)
- [Applicant Manual](./docs/applicant-manual.pdf)
- [Staff Manual](./docs/staff-manual.pdf)
- [Manager Manual](./docs/manager-manual.pdf)
- [Admin Manual](./docs/admin-manual.pdf)

---

## 📝 License

MIT License

Copyright (c) 2026 Boitsholo Ramokhua

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---

## 📞 Contact

- **Student**: Boitsholo Ramokhua
- **Student ID**: 202202152
- **Course**: Bachelor of Science in Computing with Finance
- **Institution**: University of Botswana, Department of Computer Science
- **Supervisor**: Dr. M. Lefoane
- **GitHub**: [https://github.com/ramokhua/kaboditsha](https://github.com/ramokhua/kaboditsha)
- **Email**: ramokhuaboitsholo@gmail.com

---

<div align="center">
  <img src="./frontend/src/kaboditshaLogo.png" alt="KaboDitsha Logo" width="120"/>
  <p><strong>KaboDitsha</strong> — Your Digital Path to Land Allocation</p>
  <p>© 2026 KaboDitsha. All rights reserved.</p>
  <p>Ministry of Lands and Agriculture, Botswana</p>
</div>