MedCore Hospital Management Platform

A secure, modular, and scalable Hospital Management System backend built to manage hospital operations, patient care, clinical workflows, IPD admission/discharge, pharmacy, diagnostics, procedures, billing, payments, authentication, RBAC, audit logging, and hospital location-based availability.

Repository: https://github.com/SnehashisKundu/Medcore-Hospital-Management-Platform

Table of Contents

Project Overview

Key Features

Technology Stack

Architecture

Project Structure

Core Modules

Authentication and Security

RBAC

Request Flow

Clinical Workflows

OPD Workflow

IPD Workflow

Pharmacy

Diagnostics

Procedures

Billing and Payments

Location and Availability

Audit Logging

Database and Prisma

Setup

Environment Variables

Docker

Testing

Development Status

Documentation

1. Project Overview

MedCore models the major operational and clinical workflows of a hospital. The system is not designed as isolated CRUD modules only; important entities are connected through practical workflows.

Main patient journey:

Patient
  ↓
Appointment
  ↓
Encounter
  ↓
OPD or IPD Care

IPD journey:

IPD Appointment
  ↓
Encounter
  ↓
Admission
  ↓
Bed Allocation
  ↓
Inpatient Treatment
  ↓
Billing / Payment
  ↓
Discharge Summary
  ↓
Bed Released
  ↓
Admission Discharged
  ↓
Encounter Completed

2. Key Features

JWT authentication

Access and refresh token flow

Register, login, logout and current-user access

Change password

Forgot and reset password

Secure one-time password reset tokens

Role-Based Access Control

Roles, permissions, user roles and role permissions

Audit logging

Hospital and department management

Doctor, hospital and department assignments

Patient management

Appointments and encounters

Vitals, clinical notes and diagnoses

OPD and IPD workflows

Admission and discharge

Ward, room, bed and bed allocation

Medicine and medicine stock

Prescription and medicine dispensing

Diagnostic tests and diagnostic orders

Lab results and imaging reports

Procedures and procedure orders

Procedure staff assignment

Billing and payments

Hospital location support

Nearby hospital discovery

Bed availability checking

3. Technology Stack

Technology

Purpose

Node.js

Backend runtime

Express.js

HTTP API framework

TypeScript

Type-safe development

PostgreSQL

Relational database

Prisma ORM

Typed database access

Prisma Migrate

Schema migrations

JWT

Authentication

Docker

Containerized development/infrastructure

Postman

API testing

4. System Architecture

flowchart TD
    A[Client / API Consumer] --> B[Express Routes]
    B --> C[Authentication Middleware]
    C --> D[Authorization / RBAC]
    D --> E[Controller]
    E --> F[Service Layer]
    F --> G[Prisma ORM]
    G --> H[(PostgreSQL)]
    F --> I[Audit Log]
    I --> H

Routes

Define endpoints and connect requests to controllers.

Middleware

Handles shared request concerns such as authentication and authorization.

Controllers

Handle HTTP input/output and call the service layer.

Services

Contain business rules, workflow validation, relationship checks, database operations, and audit actions.

Prisma

Provides typed access to PostgreSQL and manages schema-driven database operations.

5. Project Structure

apps/api/src
│
├── config
├── controllers
├── generated
├── middleware
└── modules
    ├── admission
    ├── appointment
    ├── audit-log
    ├── auth
    ├── bed
    ├── bed-allocation
    ├── billing
    ├── clinical-note
    ├── department
    ├── diagnosis
    ├── diagnostic-order
    ├── diagnostictest
    ├── discharge-summary
    ├── doctor
    ├── doctorDepartmentAssignment
    ├── doctorHospital
    ├── encounter
    ├── hospital
    ├── hospital-procedure
    ├── imaging-report
    ├── lab-result
    ├── medicine
    ├── medicine-dispense
    ├── medicine-stock
    ├── patient
    ├── payment
    ├── permission
    ├── prescription
    ├── procedure
    ├── procedure-order
    ├── procedure-staff-assignment
    ├── role
    ├── role-permission
    ├── room
    ├── specialization
    ├── user-role
    ├── vitals
    └── ward

Most modules follow:

module/
├── <module>.service.ts
├── <module>.controller.ts
└── <module>.routes.ts

6. Core Modules

Authentication and Access

Auth

Role

Permission

Role Permission

User Role

Audit Log

Hospital Infrastructure

Hospital

Department

Ward

Room

Bed

Bed Allocation

Doctor Management

Doctor

Doctor Hospital

Doctor Department Assignment

Specialization

Patient and Clinical Care

Patient

Appointment

Encounter

Vitals

Clinical Note

Diagnosis

IPD

Admission

Bed Allocation

Discharge Summary

Pharmacy

Medicine

Medicine Stock

Prescription

Medicine Dispense

Diagnostics

Diagnostic Test

Diagnostic Order

Lab Result

Imaging Report

Procedures

Procedure

Hospital Procedure

Procedure Order

Procedure Staff Assignment

Finance

Billing

Payment

7. Authentication and Security

The authentication module supports:

Register
Login
Refresh Token
Logout
Get Current User
Change Password
Forgot Password
Reset Password

Protected requests use:

Authorization: Bearer <accessToken>

Login flow:

sequenceDiagram
    participant U as User
    participant API as Auth API
    participant DB as Database

    U->>API: Login with credentials
    API->>DB: Find user
    DB-->>API: User data
    API->>API: Verify password
    API->>API: Generate access token
    API->>API: Generate refresh token
    API-->>U: Tokens and user data

Password recovery flow:

Forgot Password
    ↓
Check Active Account
    ↓
Generate Secure Reset Token
    ↓
Store Token Hash
    ↓
Reset Password Request
    ↓
Validate Token and Expiry
    ↓
Set New Password
    ↓
Revoke Existing Refresh Sessions

Reset tokens are designed for one-time use and are invalid after use.

8. Role-Based Access Control

Authorization is based on:

User
  ↓
User Role
  ↓
Role
  ↓
Role Permission
  ↓
Permission

Request security flow:

flowchart TD
    A[Incoming Request] --> B[JWT Authentication]
    B --> C{Valid Token?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E[Authenticated User]
    E --> F[Role / Permission Check]
    F --> G{Authorized?}
    G -->|No| H[403 Forbidden]
    G -->|Yes| I[Controller]
    I --> J[Service]
    J --> K[(Database)]

Authentication answers who is making the request. Authorization answers what that user is allowed to do.

9. Main Request Flow

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
PostgreSQL
     ↓
HTTP Response

For important mutations:

Create / Update / Delete / Workflow Action
                  ↓
             Business Logic
                  ↓
           Database Mutation
                  ↓
             Audit Log

10. Patient and Clinical Workflow

The main patient flow:

flowchart TD
    A[Patient] --> B[Appointment]
    B --> C[Encounter]
    C --> D{Consultation Type}
    D -->|OPD| E[Clinical Care]
    D -->|IPD| F[Admission]

    E --> G[Vitals]
    E --> H[Clinical Notes]
    E --> I[Diagnosis]

    F --> J[Bed Allocation]
    J --> K[Inpatient Treatment]

    G --> L[Prescription / Diagnostics / Procedures]
    H --> L
    I --> L
    K --> L

    L --> M[Billing]
    M --> N[Payment]

Clinical modules are centered around the encounter:

Encounter
  ├── Vitals
  ├── Clinical Notes
  ├── Diagnosis
  ├── Prescription
  ├── Diagnostic Orders
  └── Procedure Orders

11. OPD Workflow

flowchart TD
    A[Patient] --> B[Appointment]
    B --> C[Doctor Assignment Context]
    C --> D[OPD Encounter]
    D --> E[Vitals]
    E --> F[Clinical Notes]
    F --> G[Diagnosis]

    G --> H[Prescription]
    G --> I[Diagnostic Order]
    G --> J[Procedure Order]

    H --> K[Medicine Dispense]
    I --> L[Lab Result or Imaging Report]
    J --> M[Procedure Processing]

    K --> N[Billing]
    L --> N
    M --> N
    N --> O[Payment]

12. IPD Workflow

flowchart TD
    A[Patient] --> B[IPD Appointment]
    B --> C[IPD Encounter]
    C --> D[Admission]
    D --> E[Find Available Bed]
    E --> F[Bed Allocation]
    F --> G[Bed Occupied]
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
    R --> S[Bed Available]

    Q --> T[Admission Discharged]
    Q --> U[Encounter Completed]

Tested End-to-End IPD Flow

Appointment
    ↓
IPD Encounter
    ↓
Admission
    ↓
Bed Allocation
    ↓
Bed Occupied
    ↓
Patient Discharge
    ↓
Bed Released / Available
    ↓
Admission Discharged
    ↓
Encounter Completed

13. Bed Management

Infrastructure hierarchy:

Hospital
  ↓
Ward
  ↓
Room
  ↓
Bed

Allocation lifecycle:

Active Admission
      ↓
Select Available Bed
      ↓
Create Bed Allocation
      ↓
Patient Occupies Bed
      ↓
Discharge
      ↓
Release Allocation
      ↓
Bed Available Again

14. Pharmacy Workflow

Modules:

Medicine

Medicine Stock

Prescription

Medicine Dispense

flowchart TD
    A[Clinical Workflow] --> B[Prescription]
    B --> C[Medicine]
    C --> D[Medicine Stock Check]
    D --> E{Stock Available?}
    E -->|Yes| F[Medicine Dispense]
    E -->|No| G[Availability / Stock Handling]
    F --> H[Dispense Record]

15. Diagnostics Workflow

Diagnostic Test
      ↓
Diagnostic Order
      ↓
Test Processing
      ├── Lab Result
      └── Imaging Report

flowchart TD
    A[Clinical Encounter] --> B[Diagnostic Order]
    B --> C[Diagnostic Test]
    C --> D{Result Type}
    D -->|Laboratory| E[Lab Result]
    D -->|Imaging| F[Imaging Report]

16. Procedure Workflow

Procedure
    ↓
Hospital Procedure Availability
    ↓
Procedure Order
    ↓
Procedure Staff Assignment
    ↓
Procedure Processing

17. Billing and Payment Workflow

flowchart LR
    A[Clinical Services / Treatment] --> B[Billing]
    B --> C[Bill Created]
    C --> D[Payment]
    D --> E[Payment Recorded]

18. Hospital Location and Availability

flowchart TD
    A[User Location] --> B[Latitude and Longitude]
    B --> C[Hospital Location Data]
    C --> D[Calculate Nearby Hospitals]
    D --> E[Sort by Distance]
    E --> F[Check Bed Availability]
    F --> G[Nearest Suitable Hospitals]

The goal is to support hospital discovery based on proximity and available capacity.

19. Audit Logging

Audit logging provides traceability for important system activity.

flowchart TD
    A[Authenticated Action] --> B[Controller]
    B --> C[Service]
    C --> D[Database Mutation]
    D --> E[Create Audit Log]
    E --> F[(Audit Log Storage)]

Auditable actions include important create, update, delete, and workflow state changes.

20. Database and Prisma

Data access flow:

Service
   ↓
Prisma Client
   ↓
Prisma Schema
   ↓
PostgreSQL

Prisma is used for:

Schema validation

Client generation

Migrations

Typed database access

Useful commands:

Generate Client

npx prisma generate

Create and Apply Development Migration

npx prisma migrate dev

Validate Schema

npx prisma validate

Open Prisma Studio

npx prisma studio

21. Getting Started

Prerequisites

Install:

Node.js

npm

PostgreSQL

Docker, if using the project's containerized setup

Git

Clone

git clone https://github.com/SnehashisKundu/Medcore-Hospital-Management-Platform.git
cd Medcore-Hospital-Management-Platform

Install Dependencies

Run from the correct project/package directory:

npm install

If using the monorepo structure, run commands according to the repository's workspace configuration.

22. Environment Variables

Create the required environment file according to the project configuration.

Typical examples:

DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=

Use the exact variable names required by the existing application configuration.

Never commit:

Real passwords

Production credentials

Private API keys

Real JWT secrets

Real database URLs containing credentials

Recommended .gitignore entries:

node_modules/
.env
.env.*
dist/
coverage/
*.log

23. Docker

Docker can be used for supporting infrastructure such as PostgreSQL.

Docker
   ↓
PostgreSQL Container
   ↓
DATABASE_URL
   ↓
Prisma
   ↓
Express API

Use the repository's existing Docker configuration for exact service commands.

24. API Testing

APIs were tested using Postman during development.

Testing covered:

Authentication

Protected endpoints

RBAC behavior

CRUD operations

Validation and error cases

Workflow transitions

Hospital relationships

Doctor assignments

Admission lifecycle

Bed allocation

Bed release

Discharge lifecycle

Password change

Forgot password

Reset password

Refresh token flow

Audit behavior

The major modules were tested individually and important connected workflows were tested end-to-end.

25. Implemented Module Checklist

Authentication and Access

Auth

Role

Permission

Role Permission

User Role

Audit Log

Hospital Infrastructure

Hospital

Department

Ward

Room

Bed

Bed Allocation

Doctor Management

Doctor

Doctor Hospital

Doctor Department Assignment

Specialization

Patient and Clinical Care

Patient

Appointment

Encounter

Vitals

Clinical Note

Diagnosis

IPD

Admission

Discharge Summary

Pharmacy

Medicine

Medicine Stock

Prescription

Medicine Dispense

Diagnostics

Diagnostic Test

Diagnostic Order

Lab Result

Imaging Report

Procedures

Procedure

Hospital Procedure

Procedure Order

Procedure Staff Assignment

Finance

Billing

Payment

26. Documentation

The repository documentation can be organized as:

README.md
Flow Chart.md
Hospital data.md
MedCore Ecosystem.txt

README.md

Main entry point for developers and reviewers. Covers architecture, setup, modules, workflows, security, and testing.

Flow Chart.md

Detailed visual system and workflow diagrams.

Hospital data.md

Recommended for documenting entities, relationships, ownership rules, and important data dependencies.

MedCore Ecosystem.txt

Quick high-level ecosystem view of the platform.

27. Development Status

Authentication and Security      COMPLETE
RBAC                            COMPLETE
Hospital Management             COMPLETE
Patient Management              COMPLETE
Clinical Modules                COMPLETE
IPD Workflow                    COMPLETE
Bed Management                  COMPLETE
Pharmacy                        COMPLETE
Diagnostics                     COMPLETE
Procedures                      COMPLETE
Billing and Payments            COMPLETE
Audit Logging                   COMPLETE
Location and Availability       COMPLETE
API Testing                     COMPLETED
Workflow Testing                COMPLETED
Prisma Migration and Generate   COMPLETED

Final System Summary

AUTHENTICATION
    ↓
RBAC
    ↓
HOSPITAL CONTEXT
    ↓
PATIENT
    ↓
APPOINTMENT
    ↓
ENCOUNTER
    ├──────────── OPD ────────────┐
    │                             │
    │                      Clinical Care
    │                             │
    └──────────── IPD ────────────┤
                                  ↓
                              Admission
                                  ↓
                           Bed Allocation
                                  ↓
                            Patient Care
                                  ↓
             ┌────────────────────┼────────────────────┐
             ↓                    ↓                    ↓
         Pharmacy            Diagnostics          Procedures
             └────────────────────┼────────────────────┘
                                  ↓
                               Billing
                                  ↓
                               Payment
                                  ↓
                       Discharge / Completion
                                  ↓
                               Audit Log

Built For

MedCore is designed around:

Modularity

Maintainability

Security

Traceability

Workflow consistency

Clear domain separation

Scalable backend organization

MedCore Hospital Management Platform
A modular backend for hospital operations, patient care, security, and connected clinical workflows.
