# CasaOS Deployment

NRC Second Brain runs privately on your CasaOS server. Its database, uploads, configuration, and backups live outside the containers, so rebuilding the app does not erase your information.

## Before First Start

1. Clone this repository to a stable server folder, for example `/opt/nrc-second-brain`.
2. Create these persistent folders:
   - `/DATA/AppData/nrc-second-brain/uploads`
   - `/DATA/AppData/nrc-second-brain/config`
   - `/DATA/AppData/nrc-second-brain/db`
   - `/DATA/AppData/nrc-second-brain/backups`
3. Copy `.env.example` to `.env` inside the cloned repository.
4. Set unique values for `SESSION_SECRET`, `CREDENTIALS_ENCRYPTION_KEY`, and `POSTGRES_PASSWORD` in `.env`.

`CREDENTIALS_ENCRYPTION_KEY` must be a base64-encoded 32-byte key. Create one once with `openssl rand -base64 32`, save it in `.env`, and do not change it after connecting GitHub, Google Drive, or creating vault notes. Changing it would make those encrypted values unreadable.

## Start in CasaOS

Use one Compose stack. Do not create `app`, `db`, and `migrate` as separate custom apps: NRC cannot start until its database and migration job are part of the same stack.

### CasaOS custom-app screen

1. In CasaOS, choose **Custom Install** then **Import**.
2. Paste the complete contents of [`docker-compose.casaos.yml`](docker-compose.casaos.yml). Do not fill the `app`, `db`, and `migrate` tabs by hand.
3. Save it as **NRC Second Brain**. CasaOS should show `ghcr.io/mkonline08/nrc-second-brain:latest` for the `app` service and `postgres:16-alpine` for the `db` service.
4. Create `/DATA/AppData/nrc-second-brain/.env` from `.env.example`, then set the three secrets before starting. In the custom-app form, use that file as the environment-file path when CasaOS asks for one.
5. Open `http://YOUR-SERVER-IP:3000` and complete the one-time administrator setup.

### Terminal install

From the cloned project folder, use `docker compose -f docker-compose.yml up -d --build`. This is the simplest recovery path if a previous CasaOS custom-app record is greyed out.

For CasaOS files, change the left side of `/DATA/Media:/library:ro` in the selected compose file to the folder you want NRC to discover. It is mounted read-only, so NRC never alters the original library.

NRC checks that mounted folder automatically when the workspace opens, at most once every five minutes. Use **Scan server** in the workspace for an immediate scan into the selected workspace.

## Domain and Playit.gg

1. Create a Playit tunnel that forwards your public hostname to the CasaOS machine on port `3000`.
2. Follow Playit's DNS instructions for your domain.
3. Enable HTTPS in Playit and set `APP_BASE_URL` in `.env` to your final `https://` address.
4. Restart the app after changing `.env`.

Expose only NRC's port through Playit. Do not expose CasaOS itself or PostgreSQL.

## Optional Integrations

- **GitHub:** create a fine-grained access token that can read only the repositories you choose, then connect it in NRC Settings.
- **Google Drive:** create a Google OAuth web client. Its redirect address must be `https://YOUR-DOMAIN/api/integrations/google/callback`. Add its client ID and client secret to `.env`, then restart NRC before connecting Drive.
- **AI study help:** add `OPENAI_API_KEY` only when you want that optional feature. It stays disabled without the key.

## Safe Updates and Backups

Run `scripts/backup.sh` whenever you want a timestamped database, upload, and configuration backup. It keeps the most recent 30 days of backup folders.

To update from GitHub, run `scripts/update.sh` from the checked-out repository. It creates a backup, takes a fast-forward GitHub update, rebuilds the containers, and applies migrations. Do not delete `/DATA/AppData/nrc-second-brain/` unless you deliberately want to remove the app and its data.

After the GitHub container workflow has completed at least once, advanced users can instead combine `docker-compose.yml` with `docker-compose.ghcr.yml` to pull the prebuilt GitHub Container Registry image. The normal source-based update path remains the simplest default.

Keep at least one backup copy somewhere other than the CasaOS server.

