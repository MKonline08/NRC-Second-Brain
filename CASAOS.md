# CasaOS Deployment

NRC Second Brain runs as one private CasaOS app. Its database, uploads, configuration, and backups live in one folder outside the container, so rebuilding the app does not erase your information.

## Before First Start

1. Clone this repository to a stable server folder, for example `/opt/nrc-second-brain`.
2. Create one persistent folder: `/DATA/AppData/nrc-second-brain`.
3. Start NRC. On its first start it securely creates its own database, security keys, upload folder, and configuration folder inside that one location.

## Start in CasaOS

Use the single app service below. There is no separate database or migration service to set up.

### CasaOS custom-app screen

1. In CasaOS, choose **Custom Install** then **Import**.
2. Paste the complete contents of [`docker-compose.casaos.yml`](docker-compose.casaos.yml). The form should show exactly one tab, named `app`.
3. Confirm its image is `ghcr.io/mkonline08/nrc-second-brain:latest`, its port is `3000`, and its first volume is `/DATA/AppData/nrc-second-brain` to `/app/data`.
4. Save, start, then open `http://YOUR-SERVER-IP:3000` to complete the one-time administrator setup.

### Terminal install

From the cloned project folder, use `docker compose up -d --build`. This is the simplest recovery path if a previous CasaOS custom-app record is greyed out.

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

To update from GitHub, run `scripts/update.sh` from the checked-out repository. It creates a backup, takes a fast-forward GitHub update, and rebuilds the one container. Do not delete `/DATA/AppData/nrc-second-brain/` unless you deliberately want to remove the app and its data.

After the GitHub container workflow has completed at least once, CasaOS can pull the prebuilt public image automatically.

Keep at least one backup copy somewhere other than the CasaOS server.

