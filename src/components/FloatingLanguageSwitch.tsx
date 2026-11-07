"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageSwitch } from "@/components/SiteChrome";

export function FloatingLanguageSwitch() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const enabled = pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/placement/test");
  if (!enabled || !visible) return null;

  return (
    <div className="no-print fixed bottom-5 end-5 z-50 rounded-full border border-white/20 bg-navy px-4 py-2 text-white shadow-sm">
      <LanguageSwitch />
    </div>
  );
}
