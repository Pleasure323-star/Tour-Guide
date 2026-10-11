"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./tour.module.css";
import { useProductTour } from "./use-product-tour";

export function ProductTour() {
  const {
    tourState,
    step,
    currentStep,
    totalSteps,
    targetRect,
    startTour,
    nextStep,
    prevStep,
    closeTour,
  } = useProductTour();

  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const isOpen = tourState !== "closed";

  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        previousFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        dialogRef.current
          ?.querySelector<HTMLElement>(
            "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
          )
          ?.focus();
      }
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      wasOpenRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeIndex = focusable.indexOf(
        document.activeElement as HTMLElement
      );
      if (activeIndex === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onDialogKeyDown);
    return () => document.removeEventListener("keydown", onDialogKeyDown);
  }, [isOpen, tourState]);

  // Auto-focus next button when step changes
  useEffect(() => {
    if (step >= 0) {
      nextBtnRef.current?.focus();
    } else if (tourState === "welcome" || tourState === "complete") {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
        )
        ?.focus();
    }
  }, [step, tourState]);

  // If tour is closed or in SSR, render nothing
  if (tourState === "closed" || typeof document === "undefined") {
    return null;
  }

  // Active tour highlight style injection for sidebar item
  const activeTarget = currentStep ? currentStep.target : null;
  const spotlightMask =
    targetRect && targetRect.width > 0
      ? `radial-gradient(
          circle ${Math.hypot(targetRect.width / 2, targetRect.height / 2) + 10}px at ${targetRect.centerX}px ${targetRect.centerY}px,
          transparent 98%,
          black 100%
        )`
      : undefined;

  return createPortal(
    <>
      {/* Keep the active link bright inside the spotlight opening. */}
      {activeTarget && (
        <style>{`
          [data-tour-target="${activeTarget}"] {
            background-color: #5F5FE1 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 4px #ffffff, 0 0 0 8px rgba(117, 104, 237, 0.6), 0 8px 26px rgba(25, 20, 79, 0.28) !important;
            transition: all 200ms ease-in-out !important;
          }
        `}</style>
      )}

      {/* 1. Welcome Modal */}
      {tourState === "welcome" && (
        <>
          <div
            className={styles.tourOverlay}
            onClick={closeTour}
            aria-hidden="true"
          />
          <section
            aria-labelledby="welcome-tour-title"
            aria-modal="true"
            className={styles.tourModal}
            ref={dialogRef}
            role="dialog"
          >
            <button
              className={styles.closeButton}
              aria-label="Close tour"
              onClick={closeTour}
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
            <div className={styles.eyebrow}>Welcome to Zedu</div>
            <h1 id="welcome-tour-title">Welcome to your Zedu workspace!</h1>
            <p>Let&apos;s take a quick tour so you can find your way around.</p>
            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={startTour}
                type="button"
              >
                Start tour
              </button>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={closeTour}
                type="button"
              >
                Skip for now
              </button>
            </div>
          </section>
        </>
      )}

      {/* 2. Step Popover */}
      {step >= 0 && currentStep && (
        <>
          <div
            className={styles.tourOverlay}
            onClick={closeTour}
            aria-hidden="true"
            style={
              spotlightMask
                ? { maskImage: spotlightMask, WebkitMaskImage: spotlightMask }
                : undefined
            }
          />
          <aside
            aria-modal="true"
            className={styles.tourPopover}
            ref={dialogRef}
            role="dialog"
            aria-label={`Tour step ${step + 1} of ${totalSteps}`}
            style={
              targetRect
                ? {
                    top: `${targetRect.top}px`,
                    left: `${targetRect.left}px`,
                  }
                : undefined
            }
          >
            <div className={styles.popoverPointer} />
            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>
                {step + 1} of {totalSteps}
              </span>
              <div className={styles.progressDots} aria-hidden="true">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <span
                    key={index}
                    className={index <= step ? styles.filled : ""}
                  />
                ))}
              </div>
            </div>
            <h2>{currentStep.title}</h2>
            <p>{currentStep.description}</p>
            <div className={styles.popoverActions}>
              <button
                className={styles.buttonText}
                onClick={closeTour}
                type="button"
              >
                Skip tour
              </button>
              <div className={styles.stepButtons}>
                <button
                  disabled={step === 0}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={prevStep}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={nextStep}
                  ref={nextBtnRef}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* 3. Completion Modal */}
      {tourState === "complete" && (
        <>
          <div
            className={styles.tourOverlay}
            onClick={closeTour}
            aria-hidden="true"
          />
          <section
            aria-labelledby="complete-tour-title"
            aria-modal="true"
            className={`${styles.tourModal} ${styles.completionModal}`}
            ref={dialogRef}
            role="dialog"
          >
            <button
              className={styles.closeButton}
              aria-label="Close tour"
              onClick={closeTour}
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
            <div className={styles.completionCheck} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m7 12.5 3.2 3.2L17.5 8" />
              </svg>
            </div>
            <div className={styles.eyebrow}>
              Tour complete · {totalSteps} of {totalSteps}
            </div>
            <h1 id="complete-tour-title">You&apos;re ready to get started!</h1>
            <p>
              Explore your workspace, visit People, or start a conversation when
              you&apos;re ready.
            </p>
            <div className={styles.modalActions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                onClick={closeTour}
                type="button"
              >
                Explore workspace
              </button>
            </div>
          </section>
        </>
      )}
    </>,
    document.body
  );
}
