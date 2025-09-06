"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TerminalLine = ({ text, delay }: { text: string; delay: number }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, [text]);

  if (delay > 0) return null; // Used to control sequence

  return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{`> ${displayText}`}</motion.p>;
};

export function BiometricTestScreen({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const logLines = [
      'SSH connection established…',
      'Running biometric analysis…',
      'Estimated time: 2–3 minutes…',
      'Processing DNA markers..................',
      'Analysis complete. Results positive.',
    ];
    
    let lineIndex = 0;
    const addLine = () => {
      if (lineIndex < logLines.length) {
        setLines(prev => [...prev, logLines[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    };
    
    const interval = setInterval(addLine, 1500);
    
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4 md:flex-row md:gap-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full text-center md:w-1/2 md:text-left"
      >
        <h1 className="text-3xl font-bold text-gray-800">Collecting biometric sample...</h1>
        <p className="text-lg text-muted-foreground">(e.g., saliva) please wait.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 w-full max-w-lg rounded-lg bg-black p-6 font-mono text-sm text-green-400 shadow-2xl md:mt-0 md:w-1/2 h-64 overflow-y-auto"
      >
        <AnimatePresence>
          {lines.map((line, index) => (
            <TerminalLine key={index} text={line} delay={0} />
          ))}
        </AnimatePresence>
        {lines.length > 2 && lines.length < 5 && <span className="animate-ping">_</span>}
      </motion.div>
    </div>
  );
}
