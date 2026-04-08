# CLAUDE.md — Full Software Development Lifecycle Guide

> This document defines roles, responsibilities, workflows, standards, and processes
> for the complete application lifecycle — from Requirements Gathering to Production Release.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Team Roles & Responsibilities](#team-roles--responsibilities)
3. [Phase 1 — Requirements Gathering](#phase-1--requirements-gathering)
4. [Phase 2 — System Design & Architecture](#phase-2--system-design--architecture)
5. [Phase 3 — Development Standards](#phase-3--development-standards)
6. [Phase 4 — Code Review & Quality Assurance](#phase-4--code-review--quality-assurance)
7. [Phase 5 — Security Engineering](#phase-5--security-engineering)
8. [Phase 6 — Testing Strategy](#phase-6--testing-strategy)
9. [Phase 7 — CI/CD Pipeline](#phase-7--cicd-pipeline)
10. [Phase 8 — Staging & UAT](#phase-8--staging--uat)
11. [Phase 9 — Production Release](#phase-9--production-release)
12. [Post-Release Operations](#post-release-operations)
13. [Communication & Collaboration](#communication--collaboration)
14. [Definition of Done (DoD)](#definition-of-done-dod)
15. [Escalation Matrix](#escalation-matrix)

---

## Project Overview

```
Project Name   : <PROJECT_NAME>
Repository     : <REPO_URL>
Tech Stack     : <FRONTEND> | <BACKEND> | <DATABASE> | <INFRA>
Environments   : Development → Staging → UAT → Production
Sprint Cycle   : 2 Weeks
Release Cadence: Bi-weekly / Monthly
```

---

## Team Roles & Responsibilities

---

### 🗂️ Project Manager (PM)

**Primary Mission:** Own the project timeline, stakeholder communication, and delivery success.

#### Responsibilities
- Define and maintain the **Project Charter**, roadmap, and release plan
- Facilitate **Sprint Planning**, **Daily Standups**, **Sprint Reviews**, and **Retrospectives**
- Manage the **Product Backlog** — prioritization, grooming, and refinement
- Track velocity, burn-down charts, and project KPIs
- Identify, document, and mitigate project **risks and blockers**
- Serve as the bridge between business stakeholders and the engineering team
- Manage scope, schedule, and budget constraints (triple constraint)
- Produce weekly **status reports** for executive stakeholders
- Coordinate cross-team dependencies and third-party integrations
- Own the **Change Request (CR)** process

#### Artifacts Owned
| Artifact | Tool |
|---|---|
| Project Charter | Confluence / Notion |
| Sprint Board | Jira / Linear |
| Risk Register | Excel / Jira |
| Release Plan | Confluence |
| Status Reports | Confluence / Email |
| Meeting Minutes | Confluence / Notion |

#### Key Metrics
- Sprint Velocity
- On-time Delivery Rate
- Backlog Health (groomed items ≥ 2 sprints ahead)
- Stakeholder Satisfaction Score

---

### 👨‍💼 Team Lead (TL)

**Primary Mission:** Bridge engineering execution and project goals while growing the team technically.

#### Responsibilities
- Break down epics and user stories into **actionable technical tasks**
- Assign tasks based on developer skill sets and availability
- Conduct **daily technical standups** and remove engineering blockers
- Enforce coding standards, architectural guidelines, and best practices
- Perform **final code reviews** before merges to `main`/`release` branches
- Drive **technical decision-making** and document Architecture Decision Records (ADRs)
- Mentor junior and mid-level developers through pair programming and feedback
- Collaborate with PM on effort estimations (story points / T-shirt sizing)
- Own the **technical roadmap** alignment with business goals
- Conduct **1:1 sessions** with team members for growth planning

#### Branching Strategy (enforced by TL)
```
main          → Production-ready code only
develop       → Integration branch for all feature work
feature/*     → Individual feature branches (from develop)
bugfix/*      → Bug fix branches (from develop)
hotfix/*      → Critical production fix branches (from main)
release/*     → Release candidate branches
```

#### Branch Protection Rules
- `main` → Requires 2 approvals + passing CI + security scan
- `develop` → Requires 1 TL approval + passing CI
- Direct commits to `main` or `develop` are **PROHIBITED**

---

### 💻 Senior Developer

**Primary Mission:** Design, implement, and deliver high-quality, scalable, and maintainable code.

#### Responsibilities
- Translate requirements into **technical design documents** and API contracts
- Implement features following SOLID, DRY, and KISS principles
- Write **unit tests** with ≥ 80% code coverage for all new code
- Write **integration tests** for service boundaries and API endpoints
- Document all public APIs using OpenAPI / Swagger
- Proactively identify and address **technical debt**
- Contribute to **architectural discussions** and ADRs
- Support junior developers through code reviews and knowledge sharing
- Ensure code is **linter-clean** before every PR
- Follow the **Definition of Done (DoD)** for every task

#### Coding Standards
```
Language Conventions:
  - Follow language-specific style guides (PEP8 / AirBnB ESLint / Google Java Style)
  - Maximum function length: 50 lines
  - Maximum file length: 300 lines
  - No commented-out dead code in PRs
  - All environment configs via .env (never hardcoded)

Naming Conventions:
  - Variables/Functions : camelCase
  - Classes/Components  : PascalCase
  - Constants           : SCREAMING_SNAKE_CASE
  - Database columns    : snake_case
  - File names          : kebab-case

Commit Message Format (Conventional Commits):
  feat(scope): short description      ← New feature
  fix(scope): short description       ← Bug fix
  refactor(scope): short description  ← Refactoring
  test(scope): short description      ← Adding tests
  docs(scope): short description      ← Documentation
  chore(scope): short description     ← Config / tooling
  hotfix(scope): short description    ← Production fix
```

#### Pull Request Checklist
- [ ] Feature/fix is complete and manually tested locally
- [ ] Unit tests written and passing (coverage ≥ 80%)
- [ ] Integration tests passing
- [ ] Linter and formatter checks pass
- [ ] No secrets, tokens, or credentials in code
- [ ] API documentation updated (if applicable)
- [ ] Migration scripts tested (if DB changes)
- [ ] PR description filled with context, screenshots, and testing steps
- [ ] Linked to the corresponding Jira/Linear ticket

---

### 🔍 QA & Testers

**Primary Mission:** Ensure the product meets functional, performance, and usability standards before release.

#### Responsibilities
- Collaborate with PM and TL during **requirements review** to ensure testability
- Write and maintain **Test Plans** and **Test Cases** for every feature
- Execute **manual testing** for exploratory, UI, and edge-case scenarios
- Design, develop, and maintain **automated test suites** (E2E, regression)
- Perform **smoke tests** after every deployment to non-production environments
- Perform **regression testing** before every release candidate
- Report, track, and verify **defect resolution** in the bug tracker
- Conduct **performance and load testing** for critical user journeys
- Validate **cross-browser and cross-device compatibility**
- Participate in **sprint demos** to evaluate feature completeness
- Maintain the QA environment and test data

#### Testing Levels
```
Level 1 — Unit Testing          → Owned by Developer
Level 2 — Integration Testing   → Owned by Developer + QA
Level 3 — System Testing        → Owned by QA
Level 4 — Performance Testing   → Owned by QA
Level 5 — UAT                   → Owned by Business Stakeholders + QA
Level 6 — Security Testing      → Owned by Security Engineer + QA
```

#### Bug Severity & Priority Matrix
| Severity | Definition | SLA (Fix Time) |
|---|---|---|
| **S1 — Critical** | App crash, data loss, security breach | Same day / Hotfix |
| **S2 — High** | Core feature broken, no workaround | Within current sprint |
| **S3 — Medium** | Feature broken, workaround exists | Next sprint |
| **S4 — Low** | Minor UI/UX issue, cosmetic | Backlog |

#### Bug Report Template
```
Title        : [Page/Module] Short description of the bug
Environment  : Dev / Staging / UAT / Production
Severity     : S1 / S2 / S3 / S4
Steps to Reproduce:
  1. Navigate to ...
  2. Click on ...
  3. Observe ...
Expected Result : ...
Actual Result   : ...
Attachments     : (Screenshots / Logs / Video)
Assigned To     : Developer Name
```

#### QA Automation Stack
```
Unit Tests      : Jest / PyTest / JUnit
API Tests       : Postman / Newman / RestAssured
E2E Tests       : Playwright / Cypress / Selenium
Load Tests      : k6 / JMeter / Locust
Test Reporting  : Allure / TestRail / Xray
```

---

### 🔐 Security Engineer

**Primary Mission:** Ensure the application and infrastructure are protected against threats throughout the entire SDLC.

#### Responsibilities
- Perform **threat modeling** during the design phase
- Define and enforce **security requirements** in the backlog
- Conduct **Static Application Security Testing (SAST)** on every PR
- Conduct **Dynamic Application Security Testing (DAST)** on staging
- Perform **dependency vulnerability scanning** (SCA) in CI pipeline
- Review authentication, authorization, and session management implementations
- Conduct **penetration testing** before major releases
- Define and enforce **secrets management** policies (no secrets in code)
- Review and harden **infrastructure configurations** (IaC security)
- Maintain a **Security Vulnerabilities Register**
- Ensure compliance with relevant standards (OWASP, GDPR, SOC2, ISO 27001)
- Conduct **security training and awareness** for the development team
- Respond to and lead **security incident management**

#### Security Standards & Checklists

##### Authentication & Authorization
- [ ] Passwords hashed with bcrypt / Argon2 (never MD5/SHA1)
- [ ] MFA implemented for admin and privileged accounts
- [ ] JWT tokens have short expiry + refresh token rotation
- [ ] Role-Based Access Control (RBAC) enforced at API layer
- [ ] OAuth 2.0 / OpenID Connect used for third-party auth

##### Input Validation & Data Protection
- [ ] All inputs validated and sanitized server-side
- [ ] Parameterized queries used (no raw SQL concatenation)
- [ ] XSS prevention headers set (CSP, X-XSS-Protection)
- [ ] CSRF tokens implemented on all state-changing requests
- [ ] Sensitive data encrypted at rest (AES-256) and in transit (TLS 1.2+)
- [ ] PII data masked in logs

##### API Security
- [ ] Rate limiting and throttling implemented
- [ ] API keys / tokens rotated regularly
- [ ] CORS policy correctly configured
- [ ] Sensitive endpoints behind authentication
- [ ] Error responses do not leak stack traces or system info

##### Infrastructure Security
- [ ] Principle of least privilege applied to all IAM roles
- [ ] Security groups / firewall rules are restrictive
- [ ] All secrets stored in Vault / AWS Secrets Manager / Azure Key Vault
- [ ] Container images scanned for vulnerabilities (Trivy / Snyk)
- [ ] Database access restricted to application layer only
- [ ] Audit logging enabled for all privileged operations

#### Security Tools
```
SAST            : SonarQube / Semgrep / Checkmarx
DAST            : OWASP ZAP / Burp Suite
SCA (Deps)      : Snyk / Dependabot / OWASP Dependency-Check
Container Scan  : Trivy / Clair / Anchore
Secrets Scan    : Gitleaks / TruffleHog
Pen Testing     : Burp Suite Pro / Metasploit
Secrets Mgmt    : HashiCorp Vault / AWS Secrets Manager
```

---

## Phase 1 — Requirements Gathering

### Participants
PM · Business Stakeholders · TL · Senior Developer · Security Engineer · QA Lead

### Activities
1. **Kickoff Meeting** — Align on business goals, success criteria, and constraints
2. **Stakeholder Interviews** — Collect functional and non-functional requirements
3. **User Story Workshop** — Write user stories in format:
   ```
   As a [user type],
   I want to [action],
   So that [benefit/outcome].
   
   Acceptance Criteria:
   - Given [context], When [action], Then [outcome]
   ```
4. **Non-Functional Requirements (NFRs)** — Define:
   - Performance targets (e.g., API response < 200ms at P95)
   - Scalability targets (e.g., support 10,000 concurrent users)
   - Availability SLA (e.g., 99.9% uptime)
   - Security and compliance requirements
   - Accessibility standards (WCAG 2.1 AA)
5. **Feasibility Assessment** — TL reviews technical feasibility
6. **Security Requirements Review** — Security Engineer identifies threats early
7. **Requirements Sign-off** — All stakeholders approve the BRD/PRD

### Artifacts Produced
- Business Requirements Document (BRD)
- Product Requirements Document (PRD)
- User Story Backlog (in Jira/Linear)
- NFR Specification Document
- Threat Model (initial draft)

---

## Phase 2 — System Design & Architecture

### Participants
TL · Senior Developer · Security Engineer · DevOps/Infra

### Activities
1. **High-Level Architecture Design** — System components, boundaries, data flows
2. **Database Design** — ERD, schema design, indexing strategy
3. **API Contract Design** — OpenAPI spec for all endpoints
4. **Infrastructure Design** — Cloud architecture, networking, scaling strategy
5. **Security Architecture Review** — Threat modeling using STRIDE
6. **ADR Documentation** — Document every significant technical decision
7. **Design Review Meeting** — Team walkthrough and approval

### Architecture Decision Record (ADR) Template
```markdown
## ADR-[NUMBER]: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded

### Context
[What is the issue that motivates this decision?]

### Decision
[What is the change that we're proposing/implementing?]

### Consequences
**Positive:** ...
**Negative:** ...
**Neutral:** ...

### Alternatives Considered
1. [Option A] — Rejected because ...
2. [Option B] — Rejected because ...
```

---

## Phase 3 — Development Standards

### Sprint Workflow
```
Day 1  : Sprint Planning (PM + TL + Devs)
Day 1–9: Development + Daily Standups (15 min)
Day 9  : Code Freeze — no new features, only bug fixes
Day 10 : Sprint Review (Demo to Stakeholders)
Day 10 : Sprint Retrospective (Team internal)
```

### Daily Standup Format (Async or Sync)
```
✅ What did I complete yesterday?
🔨 What will I work on today?
🚧 Any blockers or dependencies?
```

### Environment Configuration
```
.env.development    → Local development variables
.env.staging        → Staging environment variables
.env.production     → Production variables (managed via secrets manager)

Rules:
  - NEVER commit .env files to the repository
  - .env.example must be kept up to date with all required keys
  - Production secrets ONLY accessible through secrets manager
```

---

## Phase 4 — Code Review & Quality Assurance

### Code Review Process
```
Developer  → Opens PR from feature/* to develop
           → Assigns 1 peer reviewer + TL as required reviewer
Peer       → Reviews within 24 hours
           → Approves or requests changes with comments
TL         → Final review and merge approval
           → Merges PR after all checks pass
```

### Code Review Checklist (Reviewer)
- [ ] Code logic is correct and meets acceptance criteria
- [ ] No obvious performance bottlenecks (N+1 queries, missing indexes)
- [ ] Error handling is comprehensive (no silent failures)
- [ ] Logging is appropriate (no sensitive data logged)
- [ ] No security anti-patterns (hardcoded credentials, SQL injection risks)
- [ ] Tests are meaningful (not just coverage padding)
- [ ] Code is readable and self-documenting
- [ ] No unnecessary dependencies introduced

---

## Phase 5 — Security Engineering

### Security Gates (Enforced in CI/CD)
```
Gate 1 — PR Level   : Secrets scan (Gitleaks) + SAST (Semgrep/SonarQube)
Gate 2 — Build      : Dependency vulnerability scan (Snyk/Dependabot)
Gate 3 — Container  : Container image scan (Trivy)
Gate 4 — Staging    : DAST scan (OWASP ZAP)
Gate 5 — Pre-Release: Manual penetration test (for major releases)
```

### Security Vulnerability SLA
| Severity | Response Time | Remediation Time |
|---|---|---|
| **Critical** | 2 hours | 24 hours |
| **High** | 4 hours | 72 hours |
| **Medium** | 24 hours | Next sprint |
| **Low** | 72 hours | Backlog |

---

## Phase 6 — Testing Strategy

### Test Coverage Requirements
```
Unit Tests         : ≥ 80% code coverage (enforced in CI)
Integration Tests  : All API endpoints covered
E2E Tests          : All critical user journeys covered
Performance Tests  : Run before every major release
Security Tests     : Run on every deployment to staging
```

### Performance Testing Benchmarks
```
API Response Time  : P95 < 200ms | P99 < 500ms
Page Load Time     : < 3 seconds (LCP)
Concurrent Users   : Support defined load without degradation
Error Rate         : < 0.1% under normal load
```

### Test Environments
```
Environment     Branch          Purpose
-----------     ------          -------
Local           feature/*       Developer testing
Dev             develop         Integration testing
Staging         release/*       QA + Performance + Security testing
UAT             release/*       Business stakeholder acceptance testing
Production      main            Live environment
```

---

## Phase 7 — CI/CD Pipeline

### Pipeline Stages
```
┌─────────────────────────────────────────────────────────────┐
│                        CI Pipeline                          │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Lint &  │  Build   │  Unit    │  SAST &  │  Docker Build   │
│  Format  │          │  Tests   │  Secrets │  & Scan         │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                              ↓ (on develop merge)
┌─────────────────────────────────────────────────────────────┐
│                        CD Pipeline                          │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Deploy  │  Smoke   │  Integr. │  DAST    │  Notify Team    │
│  to Dev  │  Tests   │  Tests   │  Scan    │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                              ↓ (on release/* branch)
┌─────────────────────────────────────────────────────────────┐
│                     Staging Deployment                      │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Deploy  │  Full    │  Perf.   │  Full    │  UAT Sign-off   │
│  Staging │  Regress.│  Tests   │  DAST    │  Required       │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                              ↓ (manual approval required)
┌─────────────────────────────────────────────────────────────┐
│                    Production Deployment                    │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Blue/   │  Smoke   │  Monitor │  Notify  │  Rollback if    │
│  Green   │  Tests   │  Alerts  │  All     │  needed         │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### CI Pipeline Failure Policy
- Any pipeline stage failure **blocks the merge/deployment**
- Developer is responsible for fixing within **4 hours**
- If not fixed, TL is notified and task is re-prioritized

---

## Phase 8 — Staging & UAT

### Staging Sign-off Checklist
- [ ] All features deployed and functional
- [ ] Full regression test suite passed
- [ ] Performance benchmarks met
- [ ] DAST security scan passed (no High/Critical findings)
- [ ] Database migrations executed successfully
- [ ] Rollback procedure tested
- [ ] Monitoring and alerts configured
- [ ] Release notes drafted

### UAT Process
```
1. QA prepares UAT test scenarios and test data
2. PM schedules UAT session with business stakeholders
3. Stakeholders execute test cases against staging
4. Bugs found are triaged (S1/S2 must be fixed before release)
5. Stakeholder sign-off obtained in writing (email / Jira approval)
```

---

## Phase 9 — Production Release

### Release Checklist (Go/No-Go)
- [ ] All UAT sign-offs received
- [ ] No open S1 or S2 bugs
- [ ] Security scan — no Critical or High vulnerabilities
- [ ] Performance benchmarks met in staging
- [ ] Database migration scripts tested and ready
- [ ] Rollback plan documented and tested
- [ ] On-call engineer identified and briefed
- [ ] Stakeholder communication / release notes sent
- [ ] Monitoring dashboards reviewed and alert thresholds set
- [ ] Feature flags configured (if applicable)

### Deployment Strategy
```
Strategy          : Blue/Green Deployment (zero downtime)
Rollout           : Canary release at 5% → 25% → 100% traffic
Rollback Trigger  : Error rate > 1% | P95 latency > 500ms | Health check failure
Rollback Time     : < 5 minutes
Deployment Window : Tuesday–Thursday, 10:00 AM – 2:00 PM (business hours)
                    (Avoid Mondays, Fridays, and before public holidays)
```

### Release Notes Template
```markdown
## Release [VERSION] — [DATE]

### 🚀 New Features
- [Feature 1]: Description
- [Feature 2]: Description

### 🐛 Bug Fixes
- [Fix 1]: Description (resolves #TICKET)
- [Fix 2]: Description (resolves #TICKET)

### 🔐 Security Updates
- [Update 1]: Description

### ⚠️ Breaking Changes
- [Change 1]: What changed and migration steps

### 🔧 Infrastructure Changes
- [Change 1]: Description

### 📋 Known Issues
- [Issue 1]: Description and workaround
```

---

## Post-Release Operations

### Monitoring & Observability
```
Metrics         : Prometheus + Grafana (dashboards for all services)
Logging         : ELK Stack / Datadog (structured JSON logs)
Tracing         : Jaeger / AWS X-Ray (distributed tracing)
Uptime          : PagerDuty / Opsgenie (alerting)
Error Tracking  : Sentry (real-time error monitoring)
```

### Post-Release Monitoring Window
```
0–30 min  : All engineers on standby, monitoring dashboards
30 min–4h : On-call engineer monitors error rates and latency
4h–24h    : On-call engineer on reduced standby
24h+      : Normal operations resume
```

### Incident Management
```
SEV-1 (Critical) : Immediate response | War room | 1h RCA draft
SEV-2 (High)     : 30-min response    | Slack channel | 24h RCA
SEV-3 (Medium)   : 4-hour response    | Ticket created | Next sprint
SEV-4 (Low)      : Next business day  | Ticket created | Backlog
```

### Root Cause Analysis (RCA) Template
```markdown
## Incident RCA — [Date] — [Short Title]

**Severity:** SEV-1 / SEV-2
**Duration:** HH:MM – HH:MM (X hours X minutes)
**Impact:** [Number of users affected / services impacted]

### Timeline
| Time | Event |
|------|-------|
| HH:MM | Incident detected |
| HH:MM | Team notified |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |

### Root Cause
[Detailed technical explanation]

### Contributing Factors
- [Factor 1]
- [Factor 2]

### Resolution
[What was done to fix the issue]

### Action Items (Preventive Measures)
| Action | Owner | Due Date |
|--------|-------|----------|
| [Action 1] | [Name] | [Date] |
```

---

## Communication & Collaboration

### Meeting Cadence
| Meeting | Frequency | Duration | Participants |
|---|---|---|---|
| Daily Standup | Daily | 15 min | Full team |
| Sprint Planning | Every 2 weeks | 2 hours | PM + Full team |
| Sprint Review | Every 2 weeks | 1 hour | PM + Stakeholders + Team |
| Sprint Retro | Every 2 weeks | 1 hour | Full team |
| Backlog Grooming | Weekly | 1 hour | PM + TL + Senior Dev |
| Architecture Review | Monthly | 2 hours | TL + Senior Dev + Security |
| Security Review | Per release | 1 hour | TL + Security Eng + QA |

### Communication Channels
```
Slack / Teams Channel:
  #general          → Announcements and general discussion
  #engineering      → Technical discussions
  #incidents        → Production incidents (real-time)
  #deployments      → Deployment notifications (automated)
  #security-alerts  → Security scan results (automated)
  #qa-reports       → Test results and bug reports

Email:
  → Stakeholder updates, release notes, formal sign-offs

Jira / Linear:
  → All tasks, bugs, epics, sprint tracking
```

---

## Definition of Done (DoD)

A task/story is **DONE** only when ALL of the following are true:

### Development DoD
- [ ] Code implemented and works as per acceptance criteria
- [ ] Unit tests written with ≥ 80% coverage for new code
- [ ] Integration tests written for new API endpoints
- [ ] Code reviewed and approved by at least 1 peer + TL
- [ ] Linter and formatter pass with zero errors
- [ ] No high/critical security findings from SAST
- [ ] All PR comments addressed and resolved
- [ ] Code merged to `develop`

### QA DoD
- [ ] Test cases written and executed
- [ ] All test cases pass (or failures are accepted/tracked)
- [ ] No open S1 or S2 bugs related to the feature
- [ ] Regression tests pass
- [ ] Feature tested on required browsers/devices

### Release DoD
- [ ] Deployed to staging successfully
- [ ] Staging smoke tests pass
- [ ] UAT sign-off received
- [ ] Release notes written and approved
- [ ] Rollback plan in place
- [ ] Monitoring/alerting verified

---

## Escalation Matrix

| Issue Type | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Development blocker | Senior Developer | Team Lead | PM |
| Quality / Bug severity | QA Lead | Team Lead | PM |
| Security vulnerability | Security Engineer | Team Lead | PM + CISO |
| Production incident (SEV-1) | On-call Dev | Team Lead | PM + CTO |
| Scope change | PM | Stakeholders | Executive Sponsor |
| Resource conflict | PM | Department Head | Executive Sponsor |

---

## Document Control

| Field | Value |
|---|---|
| Document Version | 1.0.0 |
| Created By | [Author Name] |
| Created Date | [Date] |
| Last Updated | [Date] |
| Approved By | [PM / TL Name] |
| Review Frequency | Every sprint or on major changes |

---

> **Note:** This document is a living guide. All team members are responsible for keeping it
> updated as processes evolve. Submit updates via PR to the `docs/` folder for team review.
