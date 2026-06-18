"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AnimatedFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const footerTimeline = useRef<gsap.core.Timeline | null>(null);
  const hideFooterTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    gsap.set(footerRef.current, { autoAlpha: 0, yPercent: 110 });

    footerTimeline.current = gsap
      .timeline({ paused: true })
      .to(footerRef.current, { autoAlpha: 1, yPercent: 0, duration: 1, ease: "expo.out" });

    function revealFooter() {
      if (!footerTimeline.current) return;
      if (hideFooterTimer.current) window.clearTimeout(hideFooterTimer.current);
      footerTimeline.current.timeScale(1).play();
      hideFooterTimer.current = window.setTimeout(() => hideFooter(0), 520);
    }

    function hideFooter(delay = 160) {
      if (!footerTimeline.current) return;
      if (hideFooterTimer.current) window.clearTimeout(hideFooterTimer.current);
      hideFooterTimer.current = window.setTimeout(() => {
        footerTimeline.current?.timeScale(0.82).reverse();
      }, delay);
    }

    let lastScrollY = window.scrollY;
    let touchStartY: number | null = null;

    function handleWheelGesture(e: WheelEvent) {
      if (e.deltaY > 2) revealFooter();
      else if (e.deltaY < -2) hideFooter(0);
    }

    function handleTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0]?.clientY ?? null;
    }

    function handleTouchMove(e: TouchEvent) {
      const currentY = e.touches[0]?.clientY;
      if (touchStartY === null || currentY === undefined) return;
      if (touchStartY - currentY > 8) revealFooter();
      else if (currentY - touchStartY > 8) hideFooter(0);
    }

    function handleTouchEnd() { hideFooter(120); }

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      if (delta > 2) revealFooter();
      else if (delta < -2) hideFooter(0);
      lastScrollY = currentScrollY;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowDown", "PageDown", "Space"].includes(e.code)) revealFooter();
      else if (["ArrowUp", "PageUp", "Home"].includes(e.code)) hideFooter(0);
    }

    window.addEventListener("wheel", handleWheelGesture, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheelGesture);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (hideFooterTimer.current) window.clearTimeout(hideFooterTimer.current);
      footerTimeline.current?.kill();
      footerTimeline.current = null;
    };
  }, []);

  return (
    <footer
      id="dev-notes"
      ref={footerRef}
      className="fixed inset-x-0 bottom-0 z-50 flex h-24 items-center justify-center bg-[#ffffeb] px-6 text-center text-[#121212] opacity-0 shadow-[0_-24px_80px_rgba(3,73,44,0.16)] will-change-transform"
    >
      <p className="font-serif text-[18px] font-normal leading-[1.2] tracking-normal md:text-[24px]">
        Made possible by <span className="font-sans font-bold">Nine Ten Studios</span>
      </p>
    </footer>
  );
}
