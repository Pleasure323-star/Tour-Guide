"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { isStandaloneBuzzRoute, isRecorderRoute } from "~/lib/buzz/session";
import { TOUR_STEPS } from "./tour-steps";

export type TourState = "welcome" | number | "complete" | "closed";

const STORAGE_KEY_PREFIX = "zedu_tour_completed_";

export function useProductTour() {
  const pathname = usePathname();
  const { state } = useContext(DataContext);
  const [tourState, setTourState] = useState<TourState>("closed");
  const [isClient, setIsClient] = useState(false);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const rawUser = state?.user;
  const userId: string | null =
    rawUser?.id || rawUser?._id || rawUser?.email || null;

  // Hydration safeguard
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if current route should suppress the tour
  const isSuppressedRoute =
    !pathname ||
    pathname.includes("/welcome") ||
    pathname.includes("/invited") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/billing") ||
    isStandaloneBuzzRoute(pathname) ||
    isRecorderRoute(pathname);

  // Check first-time status on client after user ID and route are available
  useEffect(() => {
    if (!isClient || isSuppressedRoute || !userId) {
      return;
    }

    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
      const hasCompleted = localStorage.getItem(storageKey);

      if (!hasCompleted) {
        setTourState("welcome");
      }
    } catch {
      // localStorage security/quota error fallback
    }
  }, [isClient, isSuppressedRoute, userId]);

  const closeTour = useCallback(() => {
    if (userId) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, "true");
      } catch {
        // Safe catch for storage access errors
      }
    }
    setTourState("closed");
  }, [userId]);

  const step = typeof tourState === "number" ? tourState : -1;
  const currentStep = step >= 0 ? TOUR_STEPS[step] : null;

  // Calculate position of active nav target in real DOM
  useEffect(() => {
    if (step < 0 || !currentStep) {
      setTargetRect(null);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let observedTarget: Element | null = null;

    const updatePosition = () => {
      const el = document.querySelector(
        `[data-tour-target="${currentStep.target}"]`
      );
      if (el) {
        if (resizeObserver && el !== observedTarget) {
          resizeObserver.disconnect();
          resizeObserver.observe(el);
          observedTarget = el;
        }
        const rect = el.getBoundingClientRect();
        const nextRect = {
          top: rect.top,
          left: rect.right + 15,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        };
        setTargetRect((previous) =>
          previous &&
          previous.top === nextRect.top &&
          previous.left === nextRect.left &&
          previous.width === nextRect.width &&
          previous.height === nextRect.height
            ? previous
            : nextRect
        );
      } else {
        // Fallback default offsets
        const defaultTops: Record<string, number> = {
          home: 75,
          people: 196,
          dms: 132,
        };
        const fallbackRect = {
          top: defaultTops[currentStep.target] ?? 100,
          left: 105,
          width: 0,
          height: 0,
          centerX: 0,
          centerY: 0,
        };
        setTargetRect((previous) =>
          previous &&
          previous.top === fallbackRect.top &&
          previous.left === fallbackRect.left &&
          previous.width === 0
            ? previous
            : fallbackRect
        );
      }
    };

    resizeObserver = new ResizeObserver(updatePosition);
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("transitionend", updatePosition, true);
    window.addEventListener("animationend", updatePosition, true);
    const mutationObserver = new MutationObserver(updatePosition);
    mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("transitionend", updatePosition, true);
      window.removeEventListener("animationend", updatePosition, true);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [step, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (tourState === "closed") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTour();
      } else if (typeof tourState === "number") {
        const target = event.target;
        const typing =
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest(
              'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
            ) !== null);
        if (
          typing ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }

        if (event.key === "ArrowRight") {
          if (tourState === TOUR_STEPS.length - 1) {
            setTourState("complete");
          } else {
            setTourState(tourState + 1);
          }
        } else if (event.key === "ArrowLeft" && tourState > 0) {
          setTourState(tourState - 1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tourState, closeTour]);

  const startTour = useCallback(() => {
    setTourState(0);
  }, []);

  const nextStep = useCallback(() => {
    if (typeof tourState === "number") {
      if (tourState === TOUR_STEPS.length - 1) {
        setTourState("complete");
      } else {
        setTourState(tourState + 1);
      }
    }
  }, [tourState]);

  const prevStep = useCallback(() => {
    if (typeof tourState === "number" && tourState > 0) {
      setTourState(tourState - 1);
    }
  }, [tourState]);

  return {
    tourState,
    step,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    targetRect,
    startTour,
    nextStep,
    prevStep,
    closeTour,
  };
}
