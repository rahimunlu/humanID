"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';

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
  const [walletBalance, setWalletBalance] = useState(0);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  // Get real wallet data from wagmi
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  // Update context when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletConnected(true);
      setWalletAddress(address);
      if (balance) {
        setWalletBalance(parseFloat(balance.formatted));
      }
    } else {
      setWalletConnected(false);
      setWalletAddress(null);
      setWalletBalance(0);
    }
  }, [isConnected, address, balance]);

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
