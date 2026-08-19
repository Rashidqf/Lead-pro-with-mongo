# LeadPilot Android companion

Places cellular SIM calls when you tap **Call** in the CRM.

This app cannot be a PWA. Install it on the Android phone that should make the calls.

## Setup

1. Open the `android-companion` folder in Android Studio.
2. Let Gradle sync, then Run on your phone.
3. Allow **Phone** and **Notifications**.
4. Allow unrestricted battery use when asked.
5. Enter your CRM URL:
   - Production (Vercel): `https://your-app.vercel.app`
   - Phone and PC on the same Wi‑Fi: `http://YOUR_PC_LAN_IP:PORT` (the port from `npm run dev`)
   - Emulator: `http://10.0.2.2:PORT`
6. Sign in with the same email/password as the CRM.
7. Leave **Connect and listen** running (notification stays in the shade).

## Usage

1. Keep the companion signed in on the phone.
2. In the CRM, open a lead and tap **Call from phone**.
3. The phone dials that number on the SIM.

If the companion is offline, **Call** falls back to a `tel:` link (opens the dialer).

Call recording is not included.
