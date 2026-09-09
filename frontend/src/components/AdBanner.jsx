import { useEffect } from "react";
import { useAuth } from "../AuthContext";

export default function AdBanner({ slot, format = "auto", style }) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const { user } = useAuth();

  const isPremium =
    user?.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());

  useEffect(() => {
    if (!client || isPremium) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet or blocked — fail silently.
    }
  }, [client, isPremium]);

  // Premium users never see ads. Also don't render an empty ad slot
  // until AdSense is actually configured.
  if (!client || isPremium) return null;

  return (
    <ins
      className="adsbygoogle"
      style={style || { display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
