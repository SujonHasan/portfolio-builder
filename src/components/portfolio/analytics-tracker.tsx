"use client";

import { useEffect } from "react";

export function AnalyticsTracker({ page, siteUsername }: { page: string; siteUsername?: string }) {
  useEffect(() => {
    const url = siteUsername
      ? `/api/analytics/track?site=${encodeURIComponent(siteUsername)}`
      : "/api/analytics/track";

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [page, siteUsername]);

  return null;
}
