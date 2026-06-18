"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { getVideos, Video } from './firebase/functions';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos()
      .then(setVideos)
      .catch((error) => {
        console.error("Error loading videos:", error);
      });
  }, []);

  return (
    <main>
      {
        videos.map((video) => (
          <Link href={`/watch?v=${video.filename}`} key={video.id}>
            <Image src={'/thumbnail.png'} alt='video' width={120} height={80}
              className={styles.thumbnail}/>
          </Link>
        ))
      }
    </main>
  )
}
