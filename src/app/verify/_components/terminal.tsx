"use client";

import { useState, useEffect, useRef } from 'react';

const logLines = [
  { text: '> SSH connection established with humanID_v0.9...', delay: 100 },
  { text: '> Authenticating...', delay: 1500 },
  { text: '> Authentication successful.', delay: 500 },
  { text: '> Running biometric analysis...', delay: 1000 },
  { text: '[ANALYSIS] Reading DNA markers... 25%', delay: 800 },
  { text: '[ANALYSIS] Reading DNA markers... 50%', delay: 800 },
  { text: '[ANALYSIS] Reading DNA markers... 75%', delay: 800 },
  { text: '[ANALYSIS] Validating unique human genome.', delay: 1200 },
  { text: '> Generating ZK-proof of humanity...', delay: 1500 },
  { text: '> ZK-proof generated and signed.', delay: 500 },
  { text: '> Disconnecting.', delay: 200 },
];

type Props = {
  onComplete: () => void;
};

export default function Terminal({ onComplete }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentLineIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const processLine = () => {
      if (currentLineIndex < logLines.length) {
        const { text, delay } = logLines[currentLineIndex];
        setLines(prev => [...prev, text]);
        currentLineIndex++;
        timeoutId = setTimeout(processLine, delay);
      } else {
        onComplete();
      }
    };

    timeoutId = setTimeout(processLine, 500);

    return () => clearTimeout(timeoutId);
  }, [onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl h-80 bg-black/50 rounded-lg p-4 font-code text-sm md:text-base text-green-400 overflow-y-auto shadow-2xl shadow-primary/20 border border-white/10">
      {lines.map((line, index) => (
        <p key={index} className="whitespace-pre-wrap animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {line}
        </p>
      ))}
      <div className="h-4 w-2 bg-green-400 animate-pulse mt-2"></div>
    </div>
  );
}
