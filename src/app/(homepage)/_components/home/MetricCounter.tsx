"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type HeroMetric = {
  text: string;
  amount: string;
};

// Within the 1.5s–2.0s range required by the ticket.
const DURATION_MS = 1900;

// Gentler ease-out so the count doesn't front-load on the first frames.
const easeOut = (progress: number) => 1 - (1 - progress) * (1 - progress);

const parseAmount = (amount: string) => {
  const match = amount.match(/^([\d,]+)(.*)$/);
  const value = match ? Number(match[1].replace(/,/g, "")) : 0;
  const suffix = match ? match[2] : "";
  const format = (n: number) =>
    `${Math.round(n).toLocaleString("en-US")}${suffix}`;
  return { value, format };
};

// Runs before paint on the client (and avoids the React SSR warning for
// useLayoutEffect) so reduced-motion and observer setup settle immediately.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const MetricCounter = ({ metrics }: { metrics: HeroMetric[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(
    () => metrics.map((metric) => parseAmount(metric.amount)),
    [metrics]
  );
  const targets = useMemo(() => parsed.map((item) => item.value), [parsed]);
  // Start at 0 so the statically rendered page shows the beginning of the
  // count, never the final number (which would flash before the animation).
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0));

  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setValues([...targets]);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    let frame = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      let startTime: number | null = null;

      const tick = (now: number) => {
        // Anchor to the first frame so progress can never be negative.
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / DURATION_MS, 1);
        const eased = easeOut(progress);
        setValues(targets.map((target) => eased * target));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setValues([...targets]); // settle exactly on the final values
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [targets]);

  return (
    <div
      ref={containerRef}
      className="grid w-full max-w-4xl grid-cols-3 place-items-center gap-1.5 sm:gap-6 md:gap-10"
    >
      {metrics.map((metric, i) => (
        <div
          key={metric.text}
          className="flex w-full max-w-[260px] flex-col items-center justify-center gap-1 px-1.5 py-1 sm:flex-col sm:gap-1 sm:px-4 sm:py-3"
        >
          <p className="relative w-fit text-lg font-semibold tabular-nums text-neutral-900 sm:text-3xl">
            {/* Screen readers announce the settled value, not the ticking one. */}
            <span className="sr-only">{parsed[i].format(targets[i])}</span>
            {/* Reserves the final width so the count-up never shifts layout. */}
            <span className="invisible" aria-hidden="true">
              {parsed[i].format(targets[i])}
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center"
            >
              {parsed[i].format(values[i])}
            </span>
          </p>
          <p className="text-[10px] leading-tight text-neutral-500 sm:text-sm">
            {metric.text}
          </p>
        </div>
      ))}
    </div>
  );
};
