# CLAUDE.md

## Purpose

This project exists primarily as a **learning playground**. Its goals are:

* Learn modern frontend development patterns and tooling
* Learn backend fundamentals (Node/Express, real-time, persistence)
* Learn how to collaborate effectively with AI coding assistants

The project may evolve into something usable by **gamers and businesses**, but learning quality and clarity always take priority over premature optimization.

---

## High‑level Architecture

This is a **full‑stack real‑time chat application**.

* **Frontend**: React (Vite) + Socket.io client + SCSS (BEM)
* **Backend**: Node.js + Express + Socket.io + SQLite (better-sqlite3)

The architecture intentionally favors:

* Explicit file structure
* Readable, boring patterns over clever abstractions
* Clear separation of concerns

---

## Repository Structure (Overview)

```
/backend
  /src
    /config        Runtime & auth configuration
    /handlers      Socket.io event handlers
    /middleware    Express middleware (auth, etc.)
    /routes        REST API routes
    /services      Business logic & data access
    server.js      Express + Socket.io bootstrap

/frontend
  /src
    /components    Shared UI components
    /features      Feature‑scoped components (auth, chat, profile)
    /contexts      React contexts (auth, global state)
    /hooks         Custom React hooks
    /styles        SCSS architecture (BEM‑based)
    /utils         Constants & formatting helpers
```

Claude should **respect this structure** and avoid introducing new top‑level concepts without strong justification.

---

## Styling & CSS Rules (Very Important)

* **SCSS only** (no CSS‑in‑JS)
* **BEM naming is mandatory**
* SCSS files are organized by:

  * `components/`
  * `features/`
  * `layout/`
  * `globals/`
  * `themes/`
  * `utils/`

Rules:

* No inline styles
* No random class names
* Prefer existing variables, mixins, and functions
* Keep styles colocated logically, not emotionally

If Claude generates markup, it must follow existing BEM conventions.

---

## Frontend Conventions

* Prefer **functional React components**
* Hooks go in `/hooks`
* Feature logic stays inside `/features`
* Shared UI stays inside `/components`

Avoid:

* Over‑abstracting too early
* Introducing state managers unless clearly justified

---

## Backend Conventions

* Express routes are thin
* Business logic lives in `/services`
* Database access is centralized (SQLite via better‑sqlite3)
* Socket logic is isolated in `/handlers`

Claude should **not** mix concerns between routes, services, and handlers.

---

## Commands Claude Can Assume

Common commands (not exhaustive):

* Frontend dev: `npm run dev`
* Linting: `npm run lint`

Tests, validations, and acceptance are **performed manually by a human**.

Claude should focus on correctness, clarity, and consistency rather than test automation.

---

## How Claude Should Behave in This Repo

Claude is expected to:

* Make **minimal, intentional changes**
* Preserve existing patterns
* Explain non‑obvious decisions in comments when appropriate
* Prefer incremental refactors over rewrites

Claude should **not**:

* Reorganize folders without explicit instruction
* Introduce new frameworks or tools casually
* Optimize prematurely

---

## What Belongs Here vs Elsewhere

### Belongs in this file (universal rules):

* Architecture expectations
* Styling and structural rules
* How to collaborate safely with the codebase

### Does NOT belong here:

* Detailed feature specs
* One‑off experiments
* Temporary instructions

Those should live in:

* `ROADMAP.md`
* Feature‑specific docs
* Inline comments

---

## Versioning & Maintenance

* This file is **versioned**
* It should be updated when:

  * Architectural decisions change
  * Styling rules evolve
  * Project goals shift

If something becomes outdated, clarity wins over loyalty to history.

---

## Security Notes

* No secrets, tokens, or credentials should ever appear here
* Assume local development only

---

## Final Principle

This project optimizes for **learning, readability, and calm iteration**.
If Claude is unsure, it should choose the option that makes the codebase easier to understand six months from now.
