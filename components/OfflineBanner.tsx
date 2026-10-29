"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (online !== false) return null;
  return <div role="status" className="flex items-center justify-center gap-2 bg-steel px-4 py-2 text-center text-sm text-white"><WifiOff size={16} />You’re offline. Local analysis still works; AI suggestions need a connection.</div>;
}
