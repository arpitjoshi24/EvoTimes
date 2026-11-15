"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60 * 1000;

function formatToday(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Re-check every minute so the date rolls over at midnight.
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

// Rounded to the minute so the snapshot only changes when it should.
function getSnapshot(): number {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

// The server has no reader's time zone, so it renders a placeholder. React
// uses this snapshot for hydration and then switches to the real one, which
// avoids any hydration mismatch.
function getServerSnapshot(): null {
  return null;
}

export default function TodayDate() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (now === null) {
    return (
      <span className="invisible shrink-0" aria-hidden="true">
        Wednesday, September 30, 2026
      </span>
    );
  }

  const today = new Date(now);

  return (
    <time dateTime={today.toISOString()} className="shrink-0">
      {formatToday(today)}
    </time>
  );
}