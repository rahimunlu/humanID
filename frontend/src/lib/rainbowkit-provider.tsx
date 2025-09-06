"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { http } from "viem";
import { sepolia, hardhat } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [injected()],
  transports: { 
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org"),
    [hardhat.id]: http(process.env.NEXT_PUBLIC_HARDHAT_RPC || "http://127.0.0.1:8545")
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
