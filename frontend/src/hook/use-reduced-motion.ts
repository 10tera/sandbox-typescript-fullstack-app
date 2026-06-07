"use client";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useLayoutEffect, useSyncExternalStore } from "react";

const userMotionPrefAtom = atomWithStorage<"system" | "reduce" | "none">(
  "motion-preference",
  "system",
  undefined,
  {
    getOnInit: true,
  },
);
export const useUserMotionPreference = () => {
  return useAtom(userMotionPrefAtom);
};

const subscribe = (callback: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const useSystemReducedMotion = () => {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
};

export const useReducedMotion = (): boolean => {
  const userPref = useAtomValue(userMotionPrefAtom);
  const systemReduced = useSystemReducedMotion();

  const reducedMotion =
    userPref === "system" ? systemReduced : userPref === "reduce";

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = String(reducedMotion);
  }, [reducedMotion]);

  return reducedMotion;
};
