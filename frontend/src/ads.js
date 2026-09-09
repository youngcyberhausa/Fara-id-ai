import { Capacitor } from "@capacitor/core";

// Google's official TEST banner unit — safe to ship, never earns real
// money, and never gets your AdMob account flagged for invalid clicks
// during development. Replace via VITE_ADMOB_BANNER_ID once you have a
// real ad unit from admob.google.com.
const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

export async function initAds(isPremium = false) {
  // Ads only make sense inside the native Android/iOS app — never on web —
  // and never for premium subscribers.
  if (!Capacitor.isNativePlatform() || isPremium) return;

  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import(
      "@capacitor-community/admob"
    );

    await AdMob.initialize({
      // Set to false once you're ready to serve real ads to real users.
      initializeForTesting: true,
    });

    const adId = import.meta.env.VITE_ADMOB_BANNER_ID || TEST_BANNER_ID;

    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
  } catch (err) {
    // Never let an ad-loading failure break the app itself.
    console.warn("AdMob failed to initialize:", err);
  }
}
