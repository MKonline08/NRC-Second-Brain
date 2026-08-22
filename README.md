# NRC Second Brain

A private visual home for school, dual enrollment, personal files, notes, links, and projects. Created by MK.

## Working foundation

- Interactive graph view with clickable items and a details panel
- Search across the visible universe
- First-run setup with a strong administrator password and private sign-in
- PostgreSQL data storage with default School, Dual Enrollment, Personal, and Projects workspaces
- Server-side file uploads with validation for PDFs, notes, Office documents, and images
- Add file/link items to the graph in the browser
- Clean, motion-aware dark interface built for a future private server deployment
- Docker packaging ready for CasaOS

## Run it locally

1. Install Node.js 20 or newer.
2. Run `pnpm install`.
3. Run `pnpm dev`.
4. Open `http://localhost:3000`.

## CasaOS plan

The included Docker Compose file runs the app on port 3000. In CasaOS, use a persistent AppData folder for uploads, database data, configuration, and backups. PostgreSQL creates the NRC tables automatically on the first fresh deployment.

## Important safety note

Never commit `.env`, uploaded files, database folders, backups, or passwords to GitHub. This repository contains only the app code and deployment instructions.
