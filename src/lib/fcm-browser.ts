import { createClientOnlyFn } from "@tanstack/react-start";

import { registerFcmToken } from "@/lib/reminder-integrations";

/** Best-effort browser FCM registration. Returns false if Firebase client env is missing. */
export const registerBrowserPush = createClientOnlyFn(async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!apiKey || !projectId || !appId || !messagingSenderId || !vapidKey) {
    return false;
  }

  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission denied");

  const { initializeApp, getApps } = await import("firebase/app");
  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");

  if (!(await isSupported())) throw new Error("Push messaging not supported in this browser");

  const app =
    getApps()[0] ??
    initializeApp({
      apiKey,
      projectId,
      appId,
      messagingSenderId,
    });

  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey });
  if (!token) throw new Error("Could not get FCM token");

  await registerFcmToken({
    data: { token, user_agent: navigator.userAgent.slice(0, 200) },
  });
  return true;
});
