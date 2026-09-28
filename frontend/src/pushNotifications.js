import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { notificationsApi } from "./api";

const CHANNEL_ID = "rubuu_dinar_alerts";

let listeners = [];
let currentToken = null;

export function isNativePushSupported() {
  return Capacitor.isNativePlatform();
}

export async function setupPushNotifications() {
  if (!isNativePushSupported()) return { enabled: false, reason: "web" };

  try {
    await PushNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Rubu'u Dinar Alerts",
      description: "Automatic Rubu'u Dinar price alerts",
      importance: 5,
      visibility: 1,
      sound: "default",
      vibration: true,
    });
  } catch {
    // Channel creation is not available on every Android version.
  }

  const existing = await PushNotifications.checkPermissions();
  let permission = existing.receive;

  if (permission !== "granted") {
    const requested = await PushNotifications.requestPermissions();
    permission = requested.receive;
  }

  if (permission !== "granted") {
    return { enabled: false, reason: "permission_denied" };
  }

  // Remove old listeners before installing new ones so React re-renders do
  // not create duplicate token registrations.
  await cleanupPushListeners();

  listeners.push(
    await PushNotifications.addListener("registration", async ({ value }) => {
      currentToken = value;
      try {
        await notificationsApi.registerDeviceToken(value, "android");
      } catch {
        // The next app start will retry registration.
      }
    })
  );

  listeners.push(
    await PushNotifications.addListener("registrationError", ({ error }) => {
      console.warn("FCM registration error:", error);
    })
  );

  listeners.push(
    await PushNotifications.addListener("pushNotificationActionPerformed", () => {
      // Tapping a Rubu'u Dinar notification simply opens the app.
      // The current price page can be opened from the app menu.
    })
  );

  await PushNotifications.register();
  return { enabled: true };
}

export async function disablePushNotifications() {
  if (!isNativePushSupported()) return;

  try {
    if (currentToken) {
      await notificationsApi.removeDeviceToken(currentToken, "android");
    }
  } catch {
    // Continue with local unregister even if the API is temporarily down.
  }

  currentToken = null;

  try {
    await PushNotifications.unregister();
  } catch {
    // Ignore platform-specific unregister failures.
  }

  await cleanupPushListeners();
}

export async function unregisterCurrentDevice() {
  if (!isNativePushSupported()) return;

  try {
    if (currentToken) {
      await notificationsApi.removeDeviceToken(currentToken, "android");
    }
  } catch {
    // Backend cleanup can be retried on next login.
  }

  currentToken = null;

  try {
    await PushNotifications.unregister();
  } catch {
    // Ignore platform-specific unregister failures.
  }

  await cleanupPushListeners();
}

export async function cleanupPushListeners() {
  for (const listener of listeners) {
    try {
      await listener.remove();
    } catch {
      // Ignore already-removed listeners.
    }
  }
  listeners = [];
}
