"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function beforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function appInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener(
      "beforeinstallprompt",
      beforeInstall
    );

    window.addEventListener(
      "appinstalled",
      appInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        beforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        appInstalled
      );
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
  }

  if (installed) return null;

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={install}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-6 py-3 text-white shadow-2xl font-semibold z-50"
    >
      📲 Uygulamayı Yükle
    </button>
  );
}