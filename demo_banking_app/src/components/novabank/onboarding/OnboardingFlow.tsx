"use client";

import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './WelcomeScreen';
import { HumanityTestPromptModal } from './HumanityTestPromptModal';
import { BiometricTestScreen } from './BiometricTestScreen';
import { HumanityTestCompleteScreen } from './HumanityTestCompleteScreen';
import { AccountSuccessModal } from './AccountSuccessModal';
import HomePage from '../HomePage';
import { Confetti } from '../Confetti';

type OnboardingStep = 
  | 'welcome'
  | 'humanity_test_prompt'
  | 'biometric_test'
  | 'humanity_test_complete'
  | 'account_success'
  | 'dashboard';

export default function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isHuman, setIsHuman] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenAccount = () => {
    startTransition(() => {
      if (isHuman) {
        setStep('account_success');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        setStep('humanity_test_prompt');
      }
    });
  };

  const handleStartTest = () => startTransition(() => setStep('biometric_test'));
  const handleTestComplete = () => {
    startTransition(() => {
        setIsHuman(true);
        setStep('humanity_test_complete');
    });
  };
  const handleReturnToApp = () => startTransition(() => handleOpenAccount());
  const handleContinueToDashboard = () => startTransition(() => setStep('dashboard'));

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onOpenAccount={handleOpenAccount} />;
      case 'biometric_test':
        return <BiometricTestScreen onComplete={handleTestComplete} />;
      case 'humanity_test_complete':
        return <HumanityTestCompleteScreen onReturn={handleReturnToApp} />;
      case 'dashboard':
        return <HomePage />;
      default:
        return <WelcomeScreen onOpenAccount={handleOpenAccount} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {showConfetti && <Confetti />}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <HumanityTestPromptModal
        isOpen={step === 'humanity_test_prompt'}
        onClose={() => setStep('welcome')}
        onStartTest={handleStartTest}
      />

      <AccountSuccessModal
        isOpen={step === 'account_success'}
        onContinue={handleContinueToDashboard}
      />
    </div>
  );
}
