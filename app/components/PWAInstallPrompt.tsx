// components/PWAInstallPrompt.tsx
import { useEffect, useState } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault(); // Prevent auto-prompt
      setDeferredPrompt(e);
      setShowInstall(true); // Show custom install button
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const choiceResult = await (deferredPrompt as any).userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("PWA setup accepted");
    } else {
      console.log("PWA setup dismissed");
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div style={{ position: "fixed", bottom: 20, left: 20 }}>
      <button onClick={handleInstallClick} style={{ padding: 10 }}>
        📲 Install Tvsiyo RideShare
      </button>
    </div>
  );
}
