# NRC Second Brain

A private visual home for school, dual enrollment, personal files, notes, links, and projects. Created by MK.

## Included features

- Draggable, pannable visual graph with searchable files, notes, tasks, links, and projects
- School, Dual Enrollment, Personal, and Projects workspaces
- Private first-run account setup, hashed passwords, signed sessions, rate limiting, and two-factor authentication
- Session/device management, activity audit log, recoverable trash, and private JSON export
- Validated uploads for PDFs, notes, Office documents, and images, plus read-only CasaOS library scanning
- Private file previews, encrypted personal vault notes with automatic five-minute lock, and expiring password-protected share links
- Calendar-ready tasks, flashcards, review flow, and an opt-in AI study assistant
- Optional GitHub repository linking and Google Drive linking
- One-container CasaOS deployment with an embedded private database, health checks, backups, and update scripts

## Run it locally

1. Install Node.js 20 or newer.
2. Run `pnpm install`.
3. Run `pnpm dev`.
4. Open `http://localhost:3000`.

## Deploy on CasaOS

1. Put this repository on the CasaOS machine, either by cloning it or using the GitHub source option in CasaOS.
2. Create `/DATA/AppData/nrc-second-brain` on the server. The first start securely creates the private database and keys inside that folder.
3. In CasaOS, import `docker-compose.casaos.yml`, which has exactly one app service, or run `docker compose up -d --build` from the project folder.
4. Open `http://SERVER-IP:3000`, complete first-run setup, and sign in.
5. Change `/DATA/Media` in `docker-compose.yml` if the folder you want to index is elsewhere. It is mounted read-only, so NRC cannot alter your original server library. NRC detects supported files automatically when you open the workspace, at most once every five minutes; **Scan server** runs an immediate scan.

The app stores its database and uploads under `/DATA/AppData/nrc-second-brain/`, outside the container. Updating or rebuilding the container does not erase that data.

## Domain with Playit.gg

1. Create a Playit tunnel that sends your chosen public hostname to the CasaOS machine on port `3000`.
2. Point the required DNS record for your domain at the value Playit provides.
3. Set `APP_BASE_URL` in `.env` to the final `https://` address, then restart the app.
4. Configure HTTPS in Playit before exposing the sign-in page publicly. Do not forward PostgreSQL or CasaOS itself to the internet.

## Optional connections

- **GitHub:** create a fine-grained personal access token with access only to repositories you want NRC to read. Add it in Settings inside NRC; it is encrypted before storage.
- **Google Drive:** create a Google OAuth web client, add `https://YOUR-DOMAIN/api/integrations/google/callback` as its redirect URI, then enter its client ID and secret in `.env`. Restart before using Settings > Google Drive.
- **AI study help:** set `OPENAI_API_KEY` in `.env` only if you want to enable it. It is off without the key. The assistant uses saved text context; it does not independently read uploaded PDF contents.

## Backup and updates

- Run `scripts/backup.sh` from the project folder to create a timestamped database and upload backup. Keep a copy somewhere other than the CasaOS machine.
- To update, run `scripts/update.sh` from any checked-out location on the CasaOS server. It makes a backup, pulls the reviewed GitHub update, then rebuilds the containers and applies database migrations without deleting the persistent data folders.
- Before updating a live server, create a backup and check the release notes. Never use a command that removes the `/DATA/AppData/nrc-second-brain/` folders unless you intentionally want to erase the application.

## Important safety note

Never commit `.env`, uploaded files, database folders, backups, or passwords to GitHub. This repository contains only the app code and deployment instructions.

