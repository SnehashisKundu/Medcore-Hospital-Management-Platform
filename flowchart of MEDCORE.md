# MedCore Hospital Management Platform – Complete System Flow Chart

## 1. High-Level System Architecture

```mermaid
flowchart TD
    A[User / Hospital Staff] --> B[Client / API Consumer]
    B --> C[Swagger UI / REST API]
    C --> D[Express API Server]
    D --> E[Authentication Middleware]
    E --> F{Valid JWT?}
    F -->|No| G[401 Unauthorized]
    F -->|Yes| H[RBAC / Permission Check]
    H --> I{Authorized?}
    I -->|No| J[403 Forbidden]
    I -->|Yes| K[Controller]
    K --> L[Service Layer]
    L --> M[Prisma ORM]
    M --> N[(PostgreSQL)]
    L --> O[Audit Log]
    O --> N
    L --> P[File / PDF Services]
    L --> Q[Appointment Reminder]
    Q --> R[BullMQ]
    R --> S[(Redis / Key Value)]
    D --> T[Socket.IO]
    T --> U[Real-time Events]
```

## 2. Production Deployment Architecture

```mermaid
flowchart TD
    A[Developer] --> B[GitHub Repository]
    B --> C[Render Web Service]
    C --> D[MedCore API]
    D --> E[(Render PostgreSQL)]
    D --> F[(Render Key Value / Redis)]
    D --> G[Swagger API Documentation]
    D --> H[Socket.IO]
    E --> I[Persistent Hospital Data]
    F --> J[Queue / Reminder Jobs]
```

### Production Stack

```text
GitHub
   ↓
Render Web Service
   ↓
MedCore Express + TypeScript API
   ├── PostgreSQL
   ├── Redis / Key Value
   ├── Socket.IO
   └── Swagger UI
```

## 3. Complete Hospital Ecosystem

```mermaid
flowchart TD
    A[MedCore Hospital Platform]
    A --> B[Authentication and Security]
    A --> C[Hospital Management]
    A --> D[Patient Management]
    A --> E[Clinical Care]
    A --> F[IPD Management]
    A --> G[Pharmacy]
    A --> H[Diagnostics]
    A --> I[Procedures]
    A --> J[Billing and Payments]
    A --> K[Audit and Monitoring]
    A --> L[Notifications and Background Jobs]

    B --> B1[Register]
    B --> B2[Login]
    B --> B3[JWT Access Token]
    B --> B4[Refresh Token]
    B --> B5[Change Password]
    B --> B6[Forgot / Reset Password]
    B --> B7[RBAC]
    B --> B8[Roles and Permissions]

    C --> C1[Hospital]
    C --> C2[Department]
    C --> C3[Specialization]
    C --> C4[Ward]
    C --> C5[Room]
    C --> C6[Bed]
    C --> C7[Doctor Hospital Assignment]
    C --> C8[Doctor Department Assignment]

    D --> D1[Patient]
    D --> D2[Appointment]

    E --> E1[Encounter]
    E --> E2[Vitals]
    E --> E3[Clinical Notes]
    E --> E4[Diagnosis]
    E --> E5[Allergy]
    E --> E6[Medication History]
    E --> E7[Vaccination]
    E --> E8[Family History]
    E --> E9[Treatment Plan]

    F --> F1[Admission]
    F --> F2[Bed Allocation]
    F --> F3[Discharge Summary]

    G --> G1[Medicine]
    G --> G2[Medicine Stock]
    G --> G3[Prescription]
    G --> G4[Medicine Dispense]

    H --> H1[Diagnostic Test]
    H --> H2[Diagnostic Order]
    H --> H3[Lab Result]
    H --> H4[Imaging Report]

    I --> I1[Procedure]
    I --> I2[Hospital Procedure]
    I --> I3[Procedure Order]
    I --> I4[Procedure Staff Assignment]

    J --> J1[Billing]
    J --> J2[Payment]

    K --> K1[Audit Logs]

    L --> L1[Appointment Reminder]
    L --> L2[BullMQ]
    L --> L3[Redis]
    L --> L4[Socket.IO]
```

## 4. Patient Care Journey

```mermaid
flowchart TD
    A[Patient Registration] --> B[Appointment]
    B --> C[Encounter]
    C --> D{Consultation Type}
    D -->|OPD| E[Clinical Care]
    D -->|IPD| F[Admission]
    D -->|Emergency| G[Emergency Care]
    D -->|Walk In| E
    D -->|Video| E
    D -->|Home Visit| E

    E --> H[Vitals]
    E --> I[Clinical Notes]
    E --> J[Diagnosis]
    E --> K[Allergy]
    E --> L[Medication History]
    E --> M[Family History]
    E --> N[Vaccination]
    E --> O[Treatment Plan]

    F --> P[Bed Allocation]
    P --> Q[Inpatient Treatment]
    Q --> H
    Q --> I
    Q --> J
    Q --> K
    Q --> L
    Q --> O

    H --> R[Prescription / Diagnostics / Procedures]
    I --> R
    J --> R
    O --> R
    Q --> R

    R --> S[Billing]
    S --> T[Payment]
    T --> U{IPD?}
    U -->|Yes| V[Discharge Summary]
    V --> W[Release Bed]
    W --> X[Encounter Completed]
    U -->|No| X
```

## 5. OPD Flow

```mermaid
flowchart LR
    A[Patient] --> B[Appointment]
    B --> C[Doctor]
    C --> D[OPD Encounter]
    D --> E[Vitals]
    D --> F[Clinical Note]
    D --> G[Diagnosis]
    D --> H[Allergy / Medical History]
    G --> I[Prescription]
    G --> J[Diagnostic Order]
    G --> K[Procedure Order]
    G --> L[Treatment Plan]
    I --> M[Medicine Dispense]
    J --> N[Lab Result / Imaging Report]
    K --> O[Procedure Completion]
    M --> P[Billing]
    N --> P
    O --> P
    P --> Q[Payment]
```

## 6. IPD Flow

```mermaid
flowchart TD
    A[Patient] --> B[Appointment / Encounter]
    B --> C[Admission]
    C --> D[Find Available Bed]
    D --> E[Bed Allocation]
    E --> F[Bed Status: Occupied]
    F --> G[Inpatient Treatment]
    G --> H[Vitals]
    G --> I[Clinical Notes]
    G --> J[Diagnosis]
    G --> K[Prescription]
    G --> L[Diagnostics]
    G --> M[Procedures]
    G --> N[Treatment Plan]
    H --> O[Billing]
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    O --> P[Payment]
    P --> Q[Discharge Summary]
    Q --> R[Release Bed]
    R --> S[Bed Status: Available]
    Q --> T[Admission: Discharged]
    Q --> U[Encounter: Completed]
```

## 7. Authentication and RBAC Flow

```mermaid
flowchart TD
    A[API Request] --> B[Authentication Middleware]
    B --> C{JWT Valid?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Extract User]
    E --> F[Role / Permission Check]
    F --> G{Permission Granted?}
    G -->|No| H[403 Forbidden]
    G -->|Yes| I[Controller]
    I --> J[Service Layer]
    J --> K[(PostgreSQL)]
    J --> L[Audit Log]
    L --> K
```

## 8. Appointment Reminder and Background Job Flow

```mermaid
flowchart TD
    A[Appointment Created / Updated] --> B[Appointment Reminder Service]
    B --> C[BullMQ Queue]
    C --> D[(Redis)]
    D --> E[Reminder Worker]
    E --> F{Reminder Due?}
    F -->|No| G[Wait]
    F -->|Yes| H[Send Reminder]
    H --> I[Notification / SMS Service]
    E --> J[Job Completed]
```

## 9. Real-Time Communication Flow

```mermaid
flowchart LR
    A[Client] --> B[Socket.IO Connection]
    B --> C[Express HTTP Server]
    C --> D[Socket.IO Server]
    D --> E[Real-Time Event]
    E --> A
    D --> F[Connected Hospital Staff]
    F --> G[Live Updates]
```

## 10. Nearest Hospital and Bed Availability

```mermaid
flowchart TD
    A[User Location] --> B[Latitude / Longitude]
    B --> C[Hospital Location Data]
    C --> D[Calculate Nearby Hospitals]
    D --> E[Sort by Distance]
    E --> F[Check Hospital Availability]
    F --> G[Check Bed Availability]
    G --> H[Return Suitable Hospitals]
    H --> I[Patient Selects Hospital]
```

## 11. Prescription and PDF Flow

```mermaid
flowchart TD
    A[Doctor] --> B[Create Prescription]
    B --> C[Prescription Service]
    C --> D[(PostgreSQL)]
    C --> E[PDF Generation]
    E --> F[PDF Document]
    F --> G[API Response / Download]
```

## 12. Audit Logging Flow

```mermaid
flowchart TD
    A[Create / Update / Delete Request] --> B[Authentication]
    B --> C[Authorization]
    C --> D[Controller]
    D --> E[Service]
    E --> F[(PostgreSQL)]
    E --> G[Create Audit Log]
    G --> F
    F --> H[Operation Completed]
    H --> I[API Response]
```

## 13. Main Backend Data Flow

```text
HTTP Request
     ↓
Express Route
     ↓
Authentication
     ↓
RBAC / Permission
     ↓
Controller
     ↓
Service
     ↓
Prisma ORM
     ↓
PostgreSQL
     ↓
API Response

For important mutations:

Service
     ↓
Audit Log
     ↓
PostgreSQL

For background jobs:

Service
     ↓
BullMQ
     ↓
Redis
     ↓
Reminder Worker

For real-time communication:

Express
     ↓
Socket.IO
     ↓
Connected Clients
```

## 14. Complete Technology Architecture

```mermaid
flowchart TD
    A[Client / Hospital Staff]
    A --> B[REST API]
    A --> C[Swagger UI]
    A --> D[Socket.IO]
    B --> E[Express + TypeScript]
    E --> F[JWT Authentication]
    F --> G[RBAC]
    G --> H[Controllers]
    H --> I[Services]
    I --> J[Prisma ORM]
    J --> K[(PostgreSQL)]
    I --> L[Audit Logging]
    L --> K
    I --> M[PDF / File Services]
    I --> N[BullMQ]
    N --> O[(Redis)]
    O --> P[Appointment Reminder Worker]
    E --> D
```

## Module Coverage

### Authentication and Access
- Auth
- Role
- Permission
- Role Permission
- User Role
- Audit Log

### Hospital Infrastructure
- Hospital
- Department
- Specialization
- Ward
- Room
- Bed
- Bed Allocation
- Doctor Hospital
- Doctor Department Assignment

### Patient and Clinical Care
- Patient
- Appointment
- Encounter
- Vitals
- Clinical Note
- Diagnosis
- Allergy
- Medication History
- Vaccination
- Family History
- Treatment Plan

### IPD
- Admission
- Bed Allocation
- Discharge Summary

### Pharmacy
- Medicine
- Medicine Stock
- Prescription
- Medicine Dispense

### Diagnostics
- Diagnostic Test
- Diagnostic Order
- Lab Result
- Imaging Report

### Procedures
- Procedure
- Hospital Procedure
- Procedure Order
- Procedure Staff Assignment

### Finance
- Billing
- Payment

### Infrastructure and Services
- PostgreSQL
- Prisma ORM
- Redis / Key Value
- BullMQ
- Socket.IO
- Swagger
- PDF Generation
- File Uploads
- JWT / RBAC
- Audit Logging

## Production Deployment

```text
Developer
    ↓
GitHub
    ↓
Render Web Service
    ↓
MedCore Hospital API
    ├── Express + TypeScript
    ├── Prisma
    ├── JWT / RBAC
    ├── Swagger
    ├── Socket.IO
    ├── PDF / File Services
    └── Appointment Reminder Worker
            │
            ├── BullMQ
            └── Redis / Key Value

MedCore API
    ↓
Render PostgreSQL
    ↓
Hospital Management Data
```

> This document represents the implemented architecture, major business workflows, backend data flow, background processing, real-time communication, and production deployment structure of the MedCore Hospital Management Platform.
