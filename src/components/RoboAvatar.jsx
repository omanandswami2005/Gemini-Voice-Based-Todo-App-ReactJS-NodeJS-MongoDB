import React, { useEffect, useRef } from "react";
import c from "classnames";
import "./robo-avatar.scss";

export default function RoboAvatar({ active, volume, hover, gesture }) {
  const mouthRef = useRef(null);
  const leftHandRef = useRef(null);
  const rightHandRef = useRef(null);

  useEffect(() => {
    let timeout = null;
    const update = () => {
      if (mouthRef.current) {
        const newHeight = Math.min(24, 4 + volume * 200);
        mouthRef.current.style.height = `${newHeight}px`;
        mouthRef.current.classList.toggle("talking", volume > 0.1);
      }
      timeout = window.setTimeout(update, 100);
    };

    update();
    return () => clearTimeout(timeout);
  }, [volume]);

  useEffect(() => {
    if (leftHandRef.current && rightHandRef.current) {
      leftHandRef.current.className = c("hand left", gesture);
      rightHandRef.current.className = c("hand right", gesture);
    }
  }, [gesture]);

  return (
    <div className={c("roboAvatar", { active, hover })}>
      <div className="head">
        <div className="eyes">
          <div className="eye left" />
          <div className="eye right" />
        </div>
        <div className="mouth" ref={mouthRef} />
      </div>
      <div className="body">
        <div className="chest">
          <div className="core" />
        </div>
        <div className="hands">
          <div className="hand left" ref={leftHandRef} />
          <div className="hand right" ref={rightHandRef} />
        </div>
      </div>
    </div>
  );
}
