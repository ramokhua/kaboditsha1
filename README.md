# 🏞️ KaboDitsha: Land Management System for Botswana

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
- [Testing Credentials](#-testing-credentials)
- [Deployment](#-deployment)
- [Project Status](#-project-status)
- [Roadmap](#-roadmap)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 📋 Project Overview

**KaboDitsha** (Setswana: "Kabo" = giving/allocation, "Ditsha" = lands) is a comprehensive web-based land management system designed to revolutionize Botswana's land allocation process. The system replaces the current manual, paper-based process with a transparent, efficient, and accessible digital platform.

### Core Statistics

| Metric | Value |
|--------|-------|
| Main Land Boards | 12 |
| Subordinate Land Boards | 40+ |
| Seeded Applicants | 2,500+ |
| Seeded Applications | 5,000+ |
| User Roles | 4 (Applicant, Staff, Manager, Admin) |

---

## 🎯 Problem Statement

Land allocation in Botswana is managed through twelve Main Land Boards and their subordinate Land Boards, all overseen by the Ministry of Land Management, Water and Sanitation Services. The current system faces critical challenges:

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
| **Admin Dashboard** | Centralized management for Land Board staff |
| **Queue Management** | FIFO (First-In-First-Out) with auto-rebalancing |
| **Document Upload** | Secure upload of Omang, marriage certificates, and supporting documents |
| **Role-Based Access** | Separate dashboards for Applicants, Staff, Managers, and Admins |
| **Analytics Dashboard** | Comprehensive charts and reports for managers |
| **Audit Logging** | Complete trail of all system actions |

### Key Benefits

- ✅ **Transparency**: Real-time queue positions with "X of Y" format
- ✅ **Efficiency**: Auto-rebalancing queue positions on status changes
- ✅ **Accessibility**: Apply from anywhere, anytime
- ✅ **Accountability**: Full audit trail of all actions
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
  // ... relations
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
  settlementType  SettlementType // CITY, TOWN, VILLAGE, FARM
  status          ApplicationStatus
  queuePosition   Int?
  purpose         String?
  submittedAt     DateTime  @default(now())
  // ... status tracking fields
}

model WaitingListStat {
  statId            String   @id @default(cuid())
  landBoardId       String
  settlementType    SettlementType
  totalCount        Int      @default(0)
  eligibleCount     Int?
  oldestDate        DateTime?
  averageWaitMonths Float?
}
```

### Database Statistics (Seeded)

| Table | Records |
|-------|---------|
| Users | 2,537 |
| Applications | 5,043+ |
| Main Land Boards | 12 |
| Subordinate Land Boards | 39 |
| Documents | ~500 |
| Notifications | 100+ |
| Waiting List Stats | 204 |

---

## ✨ Features

### Completed Features

| Category | Features | Status |
|----------|----------|--------|
| **Authentication** | Register, Login, JWT, Role-based Access | ✅ |
| **Queue Management** | FIFO Ordering, Auto-rebalancing, Real-time Updates | ✅ |
| **Application** | Multi-step Form, Document Upload, Withdrawal | ✅ |
| **Notifications** | In-app Bell, Email Alerts, Broadcast | ✅ |
| **Staff** | Review Applications, Verify Documents, Status Updates | ✅ |
| **Manager** | Regional Analytics, Performance Charts, PDF Export | ✅ |
| **Admin** | User Management, Land Board Management, Audit Logs | ✅ |
| **Public** | KPIs, Trends Chart, Gender Distribution | ✅ |

### In Progress / Planned

| Feature | Status | Target |
|---------|--------|--------|
| AI Chatbot | 📋 Planned | Final Release |
| Mobile App | 📋 Planned | Future |
| SMS Notifications | 📋 Planned | Future |
| Bulk Operations | 📋 Planned | Beta |

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
| **User Management** | ❌ | ❌ | ❌ | ✅ |
| **Land Board Management** | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs** | ❌ | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
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
| GET | `/api/statistics` | Get waiting list statistics |
| GET | `/api/applications/stats/gender` | Gender distribution |
| GET | `/api/waiting-list/stats` | Waiting list statistics |

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

# Setup database
npx prisma migrate dev
npm run seed

# Start backend server
npm run dev
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000/api

# Start frontend server
npm run dev
```

#### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |
| Prisma Studio | http://localhost:5555 (run `npx prisma studio` in backend) |

---

## 🔑 Testing Credentials

All passwords: **Password123**

| Role | Email | Region/Board |
|------|-------|--------------|
| **Admin** | `admin0.6567@kaboditsha.gov.bw` | System-wide |
| **Manager (Kgatleng)** | `tumelo.montsho.manager2@landboard.gov.bw` | Kgatleng |
| **Manager (Malete)** | `kgosi.brown.manager5@landboard.gov.bw` | Malete |
| **Staff (Kgatleng)** | `lorato.kgafela.staff3@landboard.gov.bw` | Kgatleng |
| **Staff (Malete)** | `bontle.williams.staff7@landboard.gov.bw` | Malete |
| **Applicant (Kgatleng)** | `boitumelo.smith.0.8757@botswana.co.bw` | Kgatleng |
| **Applicant (Kgatleng)** | `kabelo.mokgosi.1.8625@yahoo.com` | Kgatleng |
| **Applicant (Malete)** | `tshepo.molefe.4.6750@yahoo.com` | Malete |
| **Applicant (Malete)** | `kgosi.kelebeng.5.4094@btc.bw` | Malete |

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Render)

```bash
# Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Connect repository on render.com
# Set environment variables:
# - DATABASE_URL (internal Render PostgreSQL URL)
# - JWT_SECRET
# - JWT_EXPIRE=7d
# - FRONTEND_URL=https://your-frontend.vercel.app
```

### Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://kaboditsha.vercel.app |
| Backend API | https://kaboditsha-api.onrender.com |

---

## 📊 Project Status

### Alpha Milestone (Complete)

| Feature | Status |
|---------|--------|
| Database Schema | ✅ Complete |
| User Authentication | ✅ Complete |
| Role-Based Access | ✅ Complete |
| Land Board Data | ✅ Complete |
| Application Submission | ✅ Complete |
| Queue Management | ✅ Complete |

### Beta Milestone (90% Complete)

| Feature | Status | Due |
|---------|--------|-----|
| Document Upload | ✅ Complete | - |
| Notification System | ✅ Complete | - |
| Staff Dashboard | ✅ Complete | - |
| Manager Analytics | ✅ Complete | - |
| Admin Panel | ✅ Complete | - |
| Password Reset | ✅ Complete | -  |
| Profile Edit | ✅ Complete | -  |

---

## 🗺️ Roadmap

### Beta Milestone (April 14, 2026)
- [x] Complete notification system
- [x] Staff and Manager dashboards
- [x] Document upload with temp storage
- [ ] Password reset functionality
- [ ] Profile page edit
- [ ] End-to-end testing

### Final Release (May 2026)
- [ ] AI Chatbot integration (Llama 3.2)
- [ ] GPS location features
- [ ] Bulk operations for staff
- [ ] Advanced search and filters
- [ ] Performance optimization

### Future Enhancements
- [ ] Mobile application (React Native)
- [ ] SMS notifications
- [ ] PWA for offline access
- [ ] Integration with national databases

---

## 📚 Documentation

### Project Reports
- [Project Overview](./docs/Project%20Overview.pdf)
- [Detailed Proposal](./docs/KaboDitsha%20Detailed%20Proposal.pdf)
- [API Documentation](./docs/API.md)

### User Guides
- [Applicant Guide](./docs/User%20Manual.md#applicant-guide)
- [Staff Guide](./docs/User%20Manual.md#staff-guide)
- [Manager Guide](./docs/User%20Manual.md#manager-guide)
- [Admin Guide](./docs/User%20Manual.md#admin-guide)

---

## 🤝 Contributing

This is a final year project for the University of Botswana. For questions or suggestions, please contact the project lead.

---

## 📝 License

MIT License

Copyright (c) 2026 Boitsholo Ramokhua

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

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
```