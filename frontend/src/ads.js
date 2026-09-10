import { Capacitor } from "@capacitor/core";

// Google's official TEST ad units — safe to ship, never earn real money,
// and never get your AdMob account flagged for invalid clicks during
// development. Replace via env vars once you have real ad units.
const TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712";

const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // don't show more than once per 3 minutes
const ACTIONS_BEFORE_INTERSTITIAL = 3; // show after every 3rd "trigger" action

let admobModule = null;
let interstitialReady = false;
let lastShownAt = 0;
let actionCount = 0;
let adsDisabled = true; // flips true only after a successful native init

async function loadInterstitial() {
  if (!admobModule || adsDisabled) return;
  try {
    const adId = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || TEST_INTERSTITIAL_ID;
    await admobModule.AdMob.prepareInterstitial({ adId });
    interstitialReady = true;
  } catch (err) {
    interstitialReady = false;
    console.warn("AdMob interstitial failed to load:", err);
  }
}

export async function initAds(isPremium = false) {
  // Ads only make sense inside the native Android/iOS app — never on web —
  // and never for premium subscribers.
  if (!Capacitor.isNativePlatform() || isPremium) {
    adsDisabled = true;
    return;
  }

  try {
    const mod = await import("@capacitor-community/admob");
    admobModule = mod;
    const { AdMob, BannerAdPosition, BannerAdSize } = mod;

    await AdMob.initialize({
      // Real ads now that you have live ad unit IDs configured. Never tap
      // your own live ads afterwards — Google can suspend the account for
      // "invalid clicks" if you do.
      initializeForTesting: false,
    });

    const bannerId = import.meta.env.VITE_ADMOB_BANNER_ID || TEST_BANNER_ID;
    await AdMob.showBanner({
      adId: bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });

    adsDisabled = false;
    await loadInterstitial();

    // Reload the next interstitial automatically once one is dismissed.
    AdMob.addListener("interstitialAdDismissed", () => {
      interstitialReady = false;
      loadInterstitial();
    });
  } catch (err) {
    // Never let an ad-loading failure break the app itself.
    adsDisabled = true;
    console.warn("AdMob failed to initialize:", err);
  }
}

/**
 * Call this after meaningful user actions (e.g. finishing a calculation,
 * saving a case). Shows a full-screen interstitial occasionally — not on
 * every call — so the app doesn't feel like it's blocking the user
 * constantly. Safe to call from anywhere; it's a silent no-op on web,
 * for premium users, or before ads have finished initializing.
 */
export async function maybeShowInterstitial() {
  if (adsDisabled || !admobModule) return;

  actionCount += 1;
  const cooledDown = Date.now() - lastShownAt > INTERSTITIAL_COOLDOWN_MS;
  const dueForOne = actionCount % ACTIONS_BEFORE_INTERSTITIAL === 0;

  if (!dueForOne || !cooledDown || !interstitialReady) return;

  try {
    await admobModule.AdMob.showInterstitial();
    lastShownAt = Date.now();
    interstitialReady = false;
  } catch (err) {
    console.warn("AdMob interstitial failed to show:", err);
  }
}
