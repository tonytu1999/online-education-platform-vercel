# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- Most importantly, start the /plan mode  before building the product


## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.




This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project overview

This repository is for an AI-agent driven online education platform MVP used for course presentation. The source of truth for scope and priorities is:
- `PRD.md` for product requirements and milestone intent
- `Jobs Duty Assignment.md` for team responsibilities and delivery timing

The current working model is four parallel workstreams:
- course content and presentation materials
- mobile app for student/parent experiences
- web app for teacher/school experiences
- backend services and APIs

## Current repository state

The repository is still in an early initialization stage. There is not yet a full runnable application scaffold or package manifest in place, so there are no confirmed build/test commands to document yet.

When the app scaffold is introduced, add the actual commands here for:
- backend start/dev/test commands
- mobile app run commands
- web app run commands
- any one-off data or content generation commands

## High-level structure

Planned top-level structure:
- `backend/` for server, database, auth, AI integration, and APIs
- `frontend/mobile/` for the React Native student/parent app
- `frontend/web/` for the React teacher/school app
- `content/` for curriculum data, examples, and presentation content
- `docs/` for supporting project documents

## Working notes

- Keep implementation aligned with the MVP milestones and avoid expanding beyond the presentation scope unless the PRD is updated.
- Prefer simple, demo-friendly implementations over production-complete complexity during this phase.
- Use the PRD and duty assignment document as the main reference for scope decisions.
