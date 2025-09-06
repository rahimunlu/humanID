"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type AppState = {
  walletConnected: boolean;
  setWalletConnected: Dispatch<SetStateAction<boolean>>;
  walletAddress: string | null;
  setWalletAddress: Dispatch<SetStateAction<string | null>>;
  walletBalance: number;
  setWalletBalance: Dispatch<SetStateAction<number>>;
  deviceConnected: boolean;
  setDeviceConnected: Dispatch<SetStateAction<boolean>>;
  isVerifying: boolean;
  setIsVerifying: Dispatch<SetStateAction<boolean>>;
  isVerified: boolean;
  setIsVerified: Dispatch<SetStateAction<boolean>>;
  isIndexed: boolean;
  setIsIndexed: Dispatch<SetStateAction<boolean>>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0.42);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  const value = {
    walletConnected,
    setWalletConnected,
    walletAddress,
    setWalletAddress,
    walletBalance,
    setWalletBalance,
    deviceConnected,
    setDeviceConnected,
    isVerifying,
    setIsVerifying,
    isVerified,
    setIsVerified,
    isIndexed,
    setIsIndexed,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
