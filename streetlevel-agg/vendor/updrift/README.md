# Updrift - Job Search Platform with Mile-Radius Feature

> **Author & Branding**
>
> Project by **Christina Day** — [Daytime Creative](https://daytimecreative.com) | [GitHub](https://github.com/christinaday) | [Repo](https://github.com/christinaday/updrift) © 2025
>
> This README serves as a living playbook for Updrift. In addition to documenting features and setup, it captures the most important rules, best practices, and learnings developed during the project. As a contractor or team member, you are encouraged to add your own conventions, processes, and lessons here. This ensures that every new project can benefit from accumulated experience and preferred workflows.

## App Summary

Updrift is a next-generation job search platform designed for modern job seekers and recruiters. 

It unifies listings from multiple top job APIs, allowing users to search, filter, and discover opportunities with advanced controls like mile-radius filtering and smart autocomplete. With a fully theme-aware, accessible, and animated UI, Updrift delivers a futuristic, delightful experience on any device. Built for extensibility, it’s easy to add new data sources, customize the look and feel, and scale as your needs grow.

> **Technologies Used:**
> - Next.js (App Router)
> - React
> - TypeScript
> - Tailwind CSS
> - Prisma ORM
> - NextAuth.js (Authentication)
> - Adzuna API (Job Data)
> - JSearch API (Job Data)
> - OpenAI/AI Coding Assistant (this agent)
> - Git & GitHub
> - Vercel (Deployment)
> - Shadcn/ui (UI components)
> - Custom Theme System
> - And more as the project evolves!

## Current Features

- **Unified Job Search**: Aggregates listings from multiple APIs (Adzuna, JSearch, more coming soon)
- **Mile Radius Filtering**: Search jobs within a user-defined radius of any location
- **Modern, Theme-Aware UI**: Fully responsive, dark mode and custom themes supported
- **Smart Search Bar**: Autocomplete for job title and location, with suggestions
- **Saved Jobs & Searches**: Save jobs and search queries for quick access
- **Dashboard**: Personalized dashboard with recent searches and saved jobs
- **APIhub**: View and manage all connected job data providers
- **Glassmorphic & Animated UI**: Futuristic, performant, and visually engaging design
- **Accessibility**: Keyboard navigation, color contrast, and reduced motion support

## Project Rules & Practices

> Use this section to document coding standards, UI/UX conventions, review/QA steps, and any project-specific rules or processes. Update as you learn!

### Coding Standards
- Use theme-aware classes for all UI elements (no hardcoded colors)
- Commit after every major UI or logic change
- Use descriptive commit messages ("Component: what changed and why")
- Prefer functional, composable components

### UI/UX Principles
- Maintain visual consistency across all themes (light, dark, custom)
- Prioritize accessibility (color contrast, keyboard nav, reduced motion)
- Use micro-interactions and subtle effects for delight, not distraction

### Review & QA
- Test all major flows in both light and dark mode
- Check for mobile responsiveness and cross-browser compatibility
- Review for accessibility (screen reader, keyboard, etc.)

### Communication & Workflow
- Document all major decisions and gotchas here
- Use PRs for significant changes; request feedback early
- Keep this README/playbook up to date as the project evolves

---

(Feel free to expand or adapt these sections as you go!)

*(Update this list as new features are added!)*
