"use client";

import { MotionControls } from "../../app/animation-test/motion-controls";
import { useReducedMotion } from "../../hook/use-reduced-motion";

export const AnimationTest = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin-box1 {
                    width: 64px;
                    height: 64px;
                    background: steelblue;
                    animation: spin 1s linear infinite;
                }
                :root[data-motion="true"] .spin-box1 {
                    animation: none;
                }

                .spin-box2 {
                    width: 64px;
                    height: 64px;
                    background: steelblue;
                    animation: spin 1s linear infinite;
                }
            `}</style>

      <h1>Animation Test</h1>
      <MotionControls />

      <h2>by only css</h2>
      <div className="spin-box1" />

      <h2>by hook</h2>
      <div
        className="spin-box2"
        style={reducedMotion ? { animation: "none" } : undefined}
      />
    </div>
  );
};
