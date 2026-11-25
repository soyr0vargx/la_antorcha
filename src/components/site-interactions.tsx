"use client";

import { useEffect, useState } from "react";

export function ReadingControls() {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
      setShowBackToTop(window.scrollY > 500);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="reading-progress"
        style={{ width: `${progress}%` }}
      />
      <button
        aria-label="Volver al inicio"
        className={showBackToTop ? "back-to-top is-visible" : "back-to-top"}
        disabled={!showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        <span aria-hidden="true">↑</span>
      </button>
    </>
  );
}
