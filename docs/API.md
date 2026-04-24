# KaboDitsha API Documentation

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://kaboditsha-api.onrender.com/api`

## Authentication

Most endpoints require a JWT token. Include it in the Authorization header:

```
Authorization: Bearer <your_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register New User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "Thabo Molefe",
  "omangNumber": 123456789,
  "phone": "71234567",
  "maritalStatus": "SINGLE",
  "spouseName": ""
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "userId": "cmn...",
    "userNumber": "US002536",
    "email": "user@example.com",
    "fullName": "Thabo Molefe",
    "role": "APPLICANT"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": "cmn...",
    "email": "user@example.com",
    "fullName": "Thabo Molefe",
    "role": "APPLICANT"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.3 Get Current User

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "userId": "cmn...",
  "userNumber": "US002536",
  "email": "user@example.com",
  "fullName": "Thabo Molefe",
  "omangNumber": 123456789,
  "phone": "71234567",
  "role": "APPLICANT",
  "emailVerified": true,
  "createdAt": "2026-03-01T10:00:00.000Z"
}
```

### 1.4 Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If your email is registered, you will receive a reset link"
}
```

### 1.5 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

---

## 2. Land Board Endpoints

### 2.1 Get All Land Boards

**Endpoint:** `GET /landboards`

**Response (200 OK):**
```json
[
  {
    "landBoardId": "cmn...",
    "boardNumber": "MLB001",
    "name": "Ngwato Land Board",
    "type": "MAIN",
    "region": "Central",
    "jurisdiction": "Bamangwato Tribal Territory...",
    "officeAddress": "Private Bag 12, Serowe",
    "contactInfo": "Tel: 4621234 | Mobile: 71234567",
    "totalAllocations": 5234,
    "monthlyRate": 187,
    "subBoards": [...],
    "waitingListStats": [...]
  }
]
```

### 2.2 Get Single Land Board

**Endpoint:** `GET /landboards/:id`

**Response (200 OK):**
```json
{
  "landBoardId": "cmn...",
  "name": "Ngwato Land Board",
  "region": "Central",
  "subBoards": [...],
  "waitingListStats": [...]
}
```

---

## 3. Application Endpoints

### 3.1 Create Application

**Endpoint:** `POST /applications`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "landBoardId": "cmn...",
  "settlementType": "TOWN",
  "purpose": "Residential",
  "tempDocIds": ["temp_123", "temp_456"]
}
```

**Response (201 Created):**
```json
{
  "applicationId": "cmn...",
  "applicationNumber": "APP2026000001",
  "referenceNumber": "APP2026000001",
  "status": "SUBMITTED",
  "queuePosition": 47,
  "submittedAt": "2026-03-31T10:00:00.000Z"
}
```

### 3.2 Get User's Applications

**Endpoint:** `GET /applications/my`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "applicationId": "cmn...",
    "applicationNumber": "APP2026000001",
    "settlementType": "TOWN",
    "status": "SUBMITTED",
    "queuePosition": 47,
    "landBoard": {
      "name": "Kgatleng Land Board",
      "region": "Kgatleng"
    },
    "submittedAt": "2026-03-31T10:00:00.000Z"
  }
]
```

### 3.3 Get Application Details

**Endpoint:** `GET /applications/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "applicationId": "cmn...",
  "applicationNumber": "APP2026000001",
  "status": "UNDER_REVIEW",
  "queuePosition": 47,
  "purpose": "Residential",
  "user": {
    "fullName": "Thabo Molefe",
    "omangNumber": 123456789,
    "email": "user@example.com",
    "phone": "71234567"
  },
  "landBoard": {
    "name": "Kgatleng Land Board",
    "region": "Kgatleng"
  },
  "submittedAt": "2026-03-31T10:00:00.000Z",
  "reviewedAt": null,
  "approvedAt": null
}
```

### 3.4 Update Application Status

**Endpoint:** `PUT /applications/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Staff, Manager, Admin

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Documents verified, application approved"
}
```

**Response (200 OK):**
```json
{
  "applicationId": "cmn...",
  "status": "APPROVED",
  "approvedAt": "2026-03-31T14:30:00.000Z"
}
```

### 3.5 Upload Document

**Endpoint:** `POST /applications/:id/documents`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data:**
- `document`: File (PDF, JPEG, PNG, max 5MB)
- `documentType`: `omang`, `marriage`, `affidavit`, `proof`

**Response (201 Created):**
```json
{
  "documentId": "doc_...",
  "documentNumber": "DOC2026000001",
  "documentType": "omang",
  "filename": "omang.pdf",
  "verificationStatus": "PENDING"
}
```

### 3.6 Get Application Documents

**Endpoint:** `GET /applications/:id/documents`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "documentId": "doc_...",
    "documentType": "omang",
    "filename": "omang.pdf",
    "verificationStatus": "APPROVED",
    "uploadedAt": "2026-03-31T10:30:00.000Z"
  }
]
```

---

## 4. Waiting List Endpoints

### 4.1 Get Waiting List Statistics (All Boards)

**Endpoint:** `GET /waiting-list/stats`

**Response (200 OK):**
```json
[
  {
    "landBoardId": "cmn...",
    "boardName": "Kgatleng Land Board",
    "region": "Kgatleng",
    "totalWaiting": 152498,
    "bySettlementType": [
      {
        "settlementType": "CITY",
        "totalCount": 35671,
        "eligibleCount": 26753,
        "oldestDate": "2010-01-15T00:00:00.000Z",
        "averageWaitMonths": 156
      }
    ]
  }
]
```

### 4.2 Get Waiting List for Specific Board

**Endpoint:** `GET /waiting-list?landBoardId={boardId}&settlementType={type}`

**Response (200 OK):**
```json
{
  "applications": [
    {
      "position": 1,
      "referenceNumber": "APP2026000001",
      "applicantName": "Thabo Molefe",
      "submittedAt": "2026-03-31T10:00:00.000Z",
      "status": "SUBMITTED",
      "settlementType": "TOWN"
    }
  ],
  "statistics": {
    "totalWaiting": 47,
    "averageWaitTime": 24,
    "estimatedMonths": 18,
    "monthlyAllocationRate": 3
  }
}
```

### 4.3 Get My Queue Positions

**Endpoint:** `GET /waiting-list/my-queue`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "applicationId": "cmn...",
    "applicationNumber": "APP2026000001",
    "landBoard": "Kgatleng Land Board",
    "settlementType": "TOWN",
    "queuePosition": 47,
    "estimatedWaitMonths": 18,
    "submittedAt": "2026-03-31T10:00:00.000Z"
  }
]
```

### 4.4 Get Queue Position Details

**Endpoint:** `GET /waiting-list/queue/position/:applicationId`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "queuePosition": 47,
  "totalWaiting": 152498,
  "applicationsAhead": 46,
  "percentThrough": 0.03,
  "estimatedMonths": 18,
  "queueDisplay": "47 of 152,498 applicants",
  "progressDisplay": "0.03% through the queue"
}
```

---

## 5. Staff Endpoints

### 5.1 Get Staff Dashboard Stats

**Endpoint:** `GET /staff/stats`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Staff, Manager, Admin

**Response (200 OK):**
```json
{
  "total": 152,
  "pending": 47,
  "underReview": 23,
  "verified": 12,
  "approved": 45,
  "rejected": 25
}
```

### 5.2 Get Board Applications

**Endpoint:** `GET /staff/applications`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Staff, Manager, Admin

**Response (200 OK):**
```json
[
  {
    "applicationId": "cmn...",
    "applicationNumber": "APP2026000001",
    "user": { "fullName": "Thabo Molefe" },
    "landBoard": { "name": "Kgatleng Land Board" },
    "settlementType": "TOWN",
    "status": "SUBMITTED",
    "submittedAt": "2026-03-31T10:00:00.000Z"
  }
]
```

### 5.3 Verify Document

**Endpoint:** `PUT /staff/documents/:id/verify`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Staff, Manager, Admin

**Request Body:**
```json
{
  "status": "APPROVED",
  "rejectionReason": ""
}
```

**Response (200 OK):**
```json
{
  "documentId": "doc_...",
  "verificationStatus": "APPROVED",
  "applicationStatus": "DOCUMENTS_VERIFIED"
}
```

---

## 6. Manager Endpoints

### 6.1 Get Manager Stats

**Endpoint:** `GET /manager/stats`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Manager, Admin

**Response (200 OK):**
```json
{
  "region": "South-East",
  "boardsCount": 5,
  "staffCount": 12,
  "total": 1250,
  "pending": 450,
  "underReview": 120,
  "verified": 80,
  "approved": 400,
  "rejected": 200
}
```

### 6.2 Get Performance Analytics

**Endpoint:** `GET /manager/performance`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Manager, Admin

**Response (200 OK):**
```json
{
  "monthlyTrends": [
    { "month": "Jan", "applications": 120, "approved": 45 },
    { "month": "Feb", "applications": 135, "approved": 52 }
  ],
  "settlementDistribution": [
    { "name": "CITY", "count": 350 },
    { "name": "TOWN", "count": 420 },
    { "name": "VILLAGE", "count": 380 },
    { "name": "FARM", "count": 100 }
  ]
}
```

### 6.3 Get Region Applications

**Endpoint:** `GET /manager/applications`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Manager, Admin

**Response:** Same as `/staff/applications`

---

## 7. Admin Endpoints

### 7.1 Get All Users

**Endpoint:** `GET /admin/users`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin

**Response (200 OK):**
```json
[
  {
    "userId": "cmn...",
    "userNumber": "US002536",
    "email": "user@example.com",
    "fullName": "Thabo Molefe",
    "role": "APPLICANT",
    "phone": "71234567",
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
]
```

### 7.2 Get All Land Boards (Admin)

**Endpoint:** `GET /admin/landboards`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin

**Response:** Same as `/landboards` with additional internal fields

### 7.3 Get Audit Logs

**Endpoint:** `GET /admin/audit-logs`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `userId` (filter by user)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "auditLogId": "log_...",
      "user": { "email": "admin@kaboditsha.gov.bw" },
      "action": "User Login: admin@kaboditsha.gov.bw",
      "ipAddress": "192.168.1.1",
      "timestamp": "2026-03-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

---

## 8. Public Statistics Endpoints

### 8.1 Health Check

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2026-03-31T10:00:00.000Z"
}
```

### 8.2 Gender Statistics

**Endpoint:** `GET /applications/stats/gender`

**Response (200 OK):**
```json
{
  "maleCount": 1250,
  "femaleCount": 1150,
  "otherCount": 45,
  "perBoard": [
    { "board": "Kgatleng Land Board", "male": 650, "female": 620 }
  ]
}
```

### 8.3 Status Statistics

**Endpoint:** `GET /applications/stats/status`

**Response (200 OK):**
```json
[
  { "name": "SUBMITTED", "value": 450 },
  { "name": "UNDER_REVIEW", "value": 120 },
  { "name": "APPROVED", "value": 400 },
  { "name": "REJECTED", "value": 200 }
]
```

---

## 9. Notification Endpoints

### 9.1 Get User Notifications

**Endpoint:** `GET /notifications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `unreadOnly` (true/false)

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "notificationId": "not_...",
      "subject": "Application Status Update",
      "message": "Your application APP2026000001 is now UNDER_REVIEW",
      "type": "IN_APP",
      "readAt": null,
      "sentAt": "2026-03-31T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 9.2 Get Unread Count

**Endpoint:** `GET /notifications/unread-count`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{ "count": 3 }
```

### 9.3 Mark Notification as Read

**Endpoint:** `PUT /notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "notificationId": "not_...",
  "readAt": "2026-03-31T10:30:00.000Z"
}
```

### 9.4 Mark All as Read

**Endpoint:** `PUT /notifications/read-all`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{ "message": "All notifications marked as read" }
```

### 9.5 Broadcast Notification (Admin Only)

**Endpoint:** `POST /notifications/broadcast`

**Headers:** `Authorization: Bearer <token>`

**Roles:** Admin

**Request Body:**
```json
{
  "subject": "System Maintenance",
  "message": "The system will be down for maintenance on Sunday at 2am.",
  "type": "IN_APP"
}
```

**Response (200 OK):**
```json
{
  "message": "Broadcast sent to 2538 users",
  "count": 2538
}
```

---

## 10. Error Responses

### 10.1 Validation Error (400)

```json
{
  "errors": [
    {
      "msg": "Invalid email address",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 10.2 Unauthorized (401)

```json
{
  "error": "Authentication required"
}
```

### 10.3 Forbidden (403)

```json
{
  "error": "Access denied. Required roles: ADMIN. Your role: APPLICANT"
}
```

### 10.4 Not Found (404)

```json
{
  "error": "Application not found"
}
```

### 10.5 Server Error (500)

```json
{
  "error": "Failed to process request"
}
```

---

## 11. Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 12. Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Public Endpoints | 100 requests | 1 minute |
| Authenticated Endpoints | 500 requests | 1 minute |

---

## 13. Postman Collection

Import this collection to test the API:

```json
{
  "info": {
    "name": "KaboDitsha API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

**Last Updated:** April 1, 2026  
**Version:** 1.0.0
