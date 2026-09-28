# Rubu'u Dinar Auto Alerts

## What this feature does

1. The Android app asks for push-notification permission after login.
2. FCM registers the Android device token and sends it to the FastAPI backend.
3. `User.push_notifications_enabled` defaults to `true`.
4. Render Cron calls `POST /api/rubuu-dinar/check`.
5. The backend reuses the same live gold-price source already used by `/api/zakat/prices`.
6. Rubu'u Dinar price = 1.0625g × live 24K gold price per gram.
7. When the rounded Rubu'u Dinar price changes, FCM sends a notification.
8. The Android app can receive the notification while the app is closed.
9. The user can turn alerts OFF from the Rubu'u Dinar Alert screen.

## Required server environment variables

- `CRON_SECRET` — long random secret used by the Render Cron job.
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin service-account JSON as one environment-variable value.

Instead of the JSON variable, the backend also accepts:

- `FIREBASE_SERVICE_ACCOUNT_B64` — base64-encoded service-account JSON.

Never commit the Firebase service-account private key to GitHub.

## Firebase Android setup

Create an Android app in Firebase with this package name:

`ai.faraid.app`

Download `google-services.json` and place it locally at:

`frontend/android/app/google-services.json`

The file is ignored by Git.

For GitHub Actions, create a repository secret named:

`GOOGLE_SERVICES_JSON_BASE64`

Its value is the base64 encoding of `google-services.json`.

## Render Cron

Create a Render Cron Job that runs every 15 minutes (or another interval you choose) and executes:

```bash
curl -fsS -X POST "$FARAID_API_URL/api/rubuu-dinar/check"   -H "X-Cron-Secret: $CRON_SECRET"
```

Set:

- `FARAID_API_URL` = your deployed backend base URL, without `/api`
- `CRON_SECRET` = the same value configured on the backend

The first successful check only initializes the stored price. It does not send an alert. Later price changes trigger alerts.

## Local Android build

From `frontend`:

```bash
npm install
npm run build
npx cap sync android
```

Then build from `frontend/android` using Android Studio or Gradle.

