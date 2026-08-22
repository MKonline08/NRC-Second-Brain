# CasaOS setup

1. Create folders on the server:
   - `/DATA/AppData/nrc-second-brain/uploads`
   - `/DATA/AppData/nrc-second-brain/config`
   - `/DATA/AppData/nrc-second-brain/db`
   - `/DATA/AppData/nrc-second-brain/backups`
2. Copy `.env.example` to `.env` and set a long `SESSION_SECRET` plus a unique `POSTGRES_PASSWORD`.
3. In CasaOS, create a custom Compose app and paste in `docker-compose.yml`.
4. Point your Playit.gg tunnel at the server port `3000`.
5. In your domain DNS, connect the name you want to the Playit.gg address.

## Automatically detecting server files

The Compose file mounts `/DATA/Media` as a **read-only** library. Change that path to the exact folder you want NRC to discover, then choose **Scan server** inside NRC Second Brain. The scanner finds supported PDFs, notes, Office files, and images and adds them to the Personal workspace without moving or changing the original files.

Back up the `uploads`, `config`, and `db` folders before every app update. Updating the app container must never replace those folders.
