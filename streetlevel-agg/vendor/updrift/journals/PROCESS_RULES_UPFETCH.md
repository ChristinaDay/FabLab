# Updrift Project Process & Architecture Rules

> **This file is the canonical source of truth for process, architecture, and integration rules for the Updrift project.**

---

## Table of Contents
1. [Multi-Job API Architecture](#multi-job-api-architecture)
2. [General Project Rules](#general-project-rules)
3. [How to Add a New Job Provider](#how-to-add-a-new-job-provider)
4. [Other Process Notes](#other-process-notes)

---

## 1. Multi-Job API Architecture

### Goals
- Support multiple job APIs (Adzuna, Indeed, etc.)
- Normalize job data for a consistent frontend experience
- Allow for easy addition of new providers in the future
- Keep the codebase clean, modular, and maintainable

### Design Principles
- **Abstraction:** Each provider implements a common interface (e.g., `searchJobs(params): Promise<Job[]>`).
- **Normalization:** All job data is mapped to a unified shape before being sent to the frontend.
- **Extensibility:** Adding a new provider should require only a new adapter module and a registry update.
- **Separation of Concerns:** API logic, provider logic, and UI logic are kept separate.

### Initial Planning Steps
1. Define a unified job data model (fields every job must have)
2. Create a provider interface and registry
3. Move Adzuna logic into its own provider module
4. Update the API route to use the provider registry
5. Plan for provider selection/aggregation (user or backend driven)
6. Document how to add a new provider

---

## 2. General Project Rules

_(Add rules for code style, PRs, testing, etc. here)_

---

## 3. How to Add a New Job Provider

_(Step-by-step instructions will go here as the architecture evolves)_

---

## 4. Other Process Notes

_(Any other process, workflow, or architectural notes)_ 