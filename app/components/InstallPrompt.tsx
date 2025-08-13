"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the A2HS prompt");
    } else {
      console.log("User dismissed the A2HS prompt");
    }
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <Download size={18} />
        Install Tsviyo App
      </button>
    </div>
  );
}
