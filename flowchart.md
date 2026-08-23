# MedCore Hospital Management Platform – Complete System Flow Chart

## 1. High-Level Platform Flow

```mermaid
flowchart TD
    A[User / Hospital Staff] --> B[Authentication]
    B --> C{Authenticated?}
    C -->|No| D[Reject Request]
    C -->|Yes| E[JWT Access Token]
    E --> F[Auth Middleware]
    F --> G[RBAC / Permission Check]
    G --> H{Authorized?}
    H -->|No| I[403 Forbidden]
    H -->|Yes| J[Controller]
    J --> K[Service Layer]
    K --> L[Prisma ORM]
    L --> M[(PostgreSQL)]
    K --> N[Audit Log]
    N --> M
```

---

## 2. Complete Hospital Ecosystem Flow

```mermaid
flowchart TD
    A[MedCore Hospital Platform]

    A --> B[Auth and Security]
    A --> C[Hospital Management]
    A --> D[Patient Management]
    A --> E[Clinical Care]
    A --> F[IPD Management]
    A --> G[Pharmacy]
    A --> H[Diagnostics]
    A --> I[Procedures]
    A --> J[Billing and Payments]
    A --> K[Audit and Monitoring]

    B --> B1[Register and Login]
    B --> B2[Access Token]
    B --> B3[Refresh Token]
    B --> B4[Change Password]
    B --> B5[Forgot and Reset Password]
    B --> B6[RBAC]

    C --> C1[Hospital]
    C --> C2[Department]
    C --> C3[Ward]
    C --> C4[Room]
    C --> C5[Bed]
    C --> C6[Location and Availability]

    D --> D1[Patient]
    D --> D2[Appointment]

    E --> E1[Encounter]
    E --> E2[Vitals]
    E --> E3[Clinical Notes]
    E --> E4[Diagnosis]

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
```

---

## 3. Patient Care Journey

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

    F --> K[Bed Allocation]
    K --> L[Inpatient Treatment]
    L --> M[Discharge]

    H --> N[Prescription / Diagnostics / Procedures]
    I --> N
    J --> N
    L --> N

    N --> O[Billing]
    O --> P[Payment]
    P --> Q[Workflow Completion]
```

---

## 4. OPD Flow

```mermaid
flowchart LR
    A[Patient] --> B[Appointment]
    B --> C[Doctor]
    C --> D[OPD Encounter]
    D --> E[Vitals]
    E --> F[Clinical Note]
    F --> G[Diagnosis]

    G --> H[Prescription]
    G --> I[Diagnostic Order]
    G --> J[Procedure Order]

    H --> K[Medicine Dispense]
    I --> L[Lab Result or Imaging Report]
    J --> M[Procedure Completion]

    K --> N[Billing]
    L --> N
    M --> N
    N --> O[Payment]
```

---

## 5. IPD Flow

```mermaid
flowchart TD
    A[Patient] --> B[IPD Appointment]
    B --> C[IPD Encounter]
    C --> D[Admission]
    D --> E[Find Available Bed]
    E --> F[Bed Allocation]
    F --> G[Bed Status: Occupied]

    G --> H[Inpatient Treatment]

    H --> I[Vitals]
    H --> J[Clinical Notes]
    H --> K[Diagnosis]
    H --> L[Prescription]
    H --> M[Diagnostics]
    H --> N[Procedures]

    I --> O[Billing]
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O

    O --> P[Payment]
    P --> Q[Discharge Summary]
    Q --> R[Release Bed]
    R --> S[Bed Status: Available]
    Q --> T[Admission: Discharged]
    Q --> U[Encounter: Completed]
```

---

## 6. Security and Audit Flow

```mermaid
flowchart TD
    A[API Request] --> B[Auth Middleware]
    B --> C{Valid JWT?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Extract User]
    E --> F[Role and Permission Check]
    F --> G{Allowed?}
    G -->|No| H[403 Forbidden]
    G -->|Yes| I[Controller]
    I --> J[Service]
    J --> K[(Database)]
    J --> L[Create Audit Log]
    L --> K
```

---

## 7. Nearest Hospital and Bed Availability Flow

```mermaid
flowchart TD
    A[User Location] --> B[Latitude and Longitude]
    B --> C[Hospital Location Data]
    C --> D[Calculate Nearby Hospitals]
    D --> E[Sort by Distance]
    E --> F[Check Hospital Bed Availability]
    F --> G[Return Nearest Suitable Hospitals]
    G --> H[Patient Can Select Hospital]
```

---

## 8. Main Data Layer

```text
HTTP Request
     ↓
Express Route
     ↓
Authentication Middleware
     ↓
Authorization / RBAC
     ↓
Controller
     ↓
Service
     ↓
Prisma ORM
     ↓
PostgreSQL Database
     ↓
Response

Important mutation
     ↓
Audit Log
```

---

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
- Ward
- Room
- Bed
- Bed Allocation
- Doctor Hospital
- Doctor Department Assignment
- Specialization

### Patient and Clinical Care
- Patient
- Appointment
- Encounter
- Vitals
- Clinical Note
- Diagnosis

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

---

> This document describes the high-level implemented architecture and major workflow relationships of the MedCore Hospital Management Platform.
