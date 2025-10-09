# APIhub Integration Plan for Updrift

## Goal
Create a modular, extensible system (APIhub) to aggregate job listings from multiple APIs (Adzuna, others) and provide a unified interface for the frontend.

---

## Steps

### 1. Provider Interface
- Define a TypeScript interface for job providers.
- Input: `JobSearchParams` (from `src/types/job.ts`)
- Output: `Job[]` (unified job model)

### 2. APIhub Module
- Create an `apihub` module to manage all providers.
- Registry of providers (array or object).
- Expose a function to search all providers in parallel and aggregate results.

### 3. Refactor Adzuna Integration
- Move Adzuna logic into its own provider module implementing the interface.
- Remove direct Adzuna calls from the main search logic.

### 4. Add a Second Provider (Experimental)
- Add a mock provider or a real public API (e.g., JSearch) for demonstration.
- Ensure it implements the provider interface.

### 5. Aggregation Logic
- APIhub calls all providers in parallel.
- Merge and deduplicate results (by job_id or other unique fields).
- Return a unified, sorted list of jobs.

### 6. API Cards UI (Future)
- Use the provider registry to display cards for each API source in the UI.
- Show status, logo, and number of jobs contributed by each provider.

---

## Execution Checklist
- [ ] 1. Define provider interface
- [ ] 2. Create APIhub module and registry
- [ ] 3. Refactor Adzuna as a provider
- [ ] 4. Add a second provider (mock or JSearch)
- [ ] 5. Implement aggregation logic
- [ ] 6. Connect APIhub to jobs search API route
- [ ] 7. (Optional) Expose provider info for UI cards

---

**We will use this file to track and execute each step.** 