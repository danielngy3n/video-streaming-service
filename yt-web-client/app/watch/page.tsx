import { Suspense } from "react";
import WatchPlayer from "./watch-player";

export default function Watch() {
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <WatchPlayer />
    </Suspense>
  );
}

export const revalidate = 30; // Disable ISR to always fetch the latest video data