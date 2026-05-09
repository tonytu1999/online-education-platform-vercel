# CLAUDE.md

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
- `frontend/mobile/` for the Flutter student/parent app
- `frontend/web/` for the React teacher/school app
- `content/` for curriculum data, examples, and presentation content
- `docs/` for supporting project documents

## Working notes

- Keep implementation aligned with the MVP milestones and avoid expanding beyond the presentation scope unless the PRD is updated.
- Prefer simple, demo-friendly implementations over production-complete complexity during this phase.
- Use the PRD and duty assignment document as the main reference for scope decisions.
