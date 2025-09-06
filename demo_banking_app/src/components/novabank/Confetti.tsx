"use client";

import React, { useEffect, useMemo } from 'react';

const ConfettiPiece = ({ id }: { id: number }) => {
  const style = useMemo(() => {
    const randomXStart = Math.random() * 100;
    const randomXEnd = randomXStart + (Math.random() * 40 - 20);
    const randomYEnd = 120;
    const randomRotateStart = Math.random() * 360;
    const randomRotateEnd = randomRotateStart + (Math.random() * 360 - 180);
    const randomDelay = Math.random() * 0.5;
    const randomDuration = 2 + Math.random() * 2;
    const randomColor = `hsl(${Math.random() * 360}, 70%, 70%)`;

    const keyframes = `
      @keyframes confetti-fall-${id} {
        0% {
          transform: translate(${randomXStart}vw, -10vh) rotate(${randomRotateStart}deg);
          opacity: 1;
        }
        100% {
          transform: translate(${randomXEnd}vw, ${randomYEnd}vh) rotate(${randomRotateEnd}deg);
          opacity: 0;
        }
      }
    `;

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '10px',
      height: '16px',
      backgroundColor: randomColor,
      opacity: 0,
      animation: `confetti-fall-${id} ${randomDuration}s ${randomDelay}s cubic-bezier(0.1, 0.5, 0.5, 1) forwards`,
    };
  }, [id]);

  const keyframesId = `confetti-keyframes-${id}`;

  return (
    <>
      <style id={keyframesId}>{style['animationName'] ? `@keyframes ${style['animationName']} { ... }` : ''}</style>
      <div style={style as React.CSSProperties} />
    </>
  );
};

export function Confetti() {
  const confettiPieces = useMemo(() => Array.from({ length: 70 }).map((_, i) => i), []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {confettiPieces.map(id => <ConfettiPiece key={id} id={id} />)}
    </div>
  );
}
