"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An `<img>` that requests nothing until the page has finished loading and the
 * image is about to scroll into view. Native `loading="lazy"` starts fetching
 * up to ~2,500px ahead on mobile, which still competes with the first render;
 * this keeps decorative thumbnails entirely off the critical path.
 */
export function DeferredImage({
  src,
  width,
  height,
  className = "",
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let observer: IntersectionObserver | undefined;

    const observe = () => {
      if (!("IntersectionObserver" in window)) {
        setInView(true);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setInView(true);
            observer?.disconnect();
          }
        },
        { rootMargin: "200px" },
      );
      observer.observe(el);
    };

    if (document.readyState === "complete") observe();
    else window.addEventListener("load", observe, { once: true });

    return () => {
      window.removeEventListener("load", observe);
      observer?.disconnect();
    };
  }, []);

  return (
    // Same-origin proxy image: next/image optimization adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={inView ? src : undefined}
      alt=""
      width={width}
      height={height}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`${className} transition duration-300 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
