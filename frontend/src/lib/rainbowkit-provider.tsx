"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { http } from "viem";
import { mainnet, sepolia, hardhat } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [injected()],
  transports: { 
    [mainnet.id]: http("https://rpc.ankr.com/eth"), // Free public RPC for mainnet
    [sepolia.id]: http("https://rpc.sepolia.org"),
    [hardhat.id]: http("http://127.0.0.1:8545")
  },
  ssr: true,
});

const queryClient = new QueryClient();

export default function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
