"use client";

import { useUserMotionPreference } from "../../hook/use-reduced-motion";

export const MotionControls = () => {
  const [motionPref, setMotionPref] = useUserMotionPreference();

  return (
    <>
      <h2>Change Motion Preference</h2>
      {motionPref}
      <button
        style={{ width: "200px" }}
        type="button"
        onClick={() => setMotionPref("system")}
      >
        System
      </button>
      <button
        style={{ width: "200px" }}
        type="button"
        onClick={() => setMotionPref("reduce")}
      >
        アニメーション OFF
      </button>
      <button
        style={{ width: "200px" }}
        type="button"
        onClick={() => setMotionPref("none")}
      >
        アニメーション ON
      </button>
    </>
  );
};
