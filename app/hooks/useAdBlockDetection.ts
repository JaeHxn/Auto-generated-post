"use client";

import { useState, useEffect, useCallback } from "react";

async function detectAdBlocker(): Promise<boolean> {
  const bait = document.createElement("div");
  // Class names and ID that common ad blockers (uBlock Origin, Adblock Plus, etc.) target
  bait.className =
    "ads ad adsbox ad-banner advertisement pub_300x250 pub_728x90 text-ad textAd text_ad";
  bait.id = "adsbygoogle";
  Object.assign(bait.style, {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    width: "1px",
    height: "1px",
    pointerEvents: "none",
  });

  document.body.appendChild(bait);

  // Give ad blockers time to apply their rules
  await new Promise<void>((r) => setTimeout(r, 200));

  const computed = window.getComputedStyle(bait);
  const blocked =
    bait.offsetHeight === 0 ||
    bait.offsetWidth === 0 ||
    computed.display === "none" ||
    computed.visibility === "hidden";

  bait.remove();
  return blocked;
}

export type AdBlockStatus = "checking" | "blocked" | "allowed";

export function useAdBlockDetection(): { status: AdBlockStatus; recheck: () => void } {
  const [status, setStatus] = useState<AdBlockStatus>("checking");

  const run = useCallback(() => {
    setStatus("checking");
    detectAdBlocker().then((blocked) => setStatus(blocked ? "blocked" : "allowed"));
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { status, recheck: run };
}
