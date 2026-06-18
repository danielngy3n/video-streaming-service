"use client";

import { useSearchParams } from "next/navigation";
import styles from "./watch.module.css";

export default function WatchPlayer() {
  const videoPrefix = process.env.NEXT_PUBLIC_VIDEO_PREFIX ?? "";
  const videoSrc = useSearchParams().get("v");

  if (!videoSrc) {
    return (
      <main className={styles.container}>
        <p>No video selected.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <video
        className={styles.video}
        controls
        src={`${videoPrefix}${videoSrc}`}
      />
    </main>
  );
}
