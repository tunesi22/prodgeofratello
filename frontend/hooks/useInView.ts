"use client";

import { RefObject, useEffect, useState } from "react";

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options?: IntersectionObserverInit
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref, options]);

  return isInView;
}
