"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

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
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Fetch comprehensive wallet balance and convert to USD
  const fetchWalletBalanceUSD = async (walletAddress: string): Promise<number> => {
    try {
      // For demo purposes, we'll use a simple ETH to USD conversion
      // In production, you'd want to use a proper API like CoinGecko, CoinMarketCap, etc.
      const ethAmount = ethBalance ? parseFloat(ethBalance.formatted) : 0;
      
      // Mock ETH price (in production, fetch from API)
      const ethPriceUSD = 2500; // Approximate ETH price
      
      const totalUSD = ethAmount * ethPriceUSD;
      
      // If user has no ETH, show a small mock balance to indicate wallet is connected
      // In production, you'd fetch actual token balances (USDC, USDT, etc.)
      return totalUSD > 0 ? totalUSD : (isConnected ? 25.50 : 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return isConnected ? 25.50 : 0; // Fallback balance for connected wallets
    }
  };

  // Update context when wallet connection changes
  useEffect(() => {
    const updateBalance = async () => {
      if (isConnected && address) {
        setWalletConnected(true);
        setWalletAddress(address);
        
        // Fetch USD balance
        const usdBalance = await fetchWalletBalanceUSD(address);
        setWalletBalance(usdBalance);
      } else {
        setWalletConnected(false);
        setWalletAddress(null);
        setWalletBalance(0);
      }
    };

    updateBalance();
  }, [isConnected, address, ethBalance]);

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
