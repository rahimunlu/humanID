# HumanID Frontend - RainbowKit Integration

## 🎉 RainbowKit Wallet Connection Ready!

The HumanID frontend now includes full RainbowKit integration for seamless wallet connectivity.

## ✅ Features

- **Wallet Connection**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Real-time Balance**: Live ETH balance display
- **Network Support**: Sepolia Testnet and Hardhat Local
- **Disconnect Functionality**: Clean wallet disconnection
- **Responsive UI**: Beautiful wallet interface

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_HUMANID_BACKEND_BASE=http://localhost:8001
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

### 4. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Wallet Providers
The app supports:
- **MetaMask**: Browser extension
- **WalletConnect**: Mobile wallets
- **Coinbase Wallet**: Coinbase integration
- **Injected Wallets**: Any EIP-1193 compatible wallet

### Networks
- **Sepolia Testnet**: Main testnet for development
- **Hardhat Local**: Local development network

## 🎯 Usage

1. **Connect Wallet**: Click "Connect Existing Wallet" button
2. **Select Provider**: Choose from available wallet options
3. **Approve Connection**: Confirm in your wallet
4. **View Balance**: See real-time ETH balance
5. **Disconnect**: Use disconnect button when done

## 🔗 Integration Points

- **Backend**: Connects to HumanID FastAPI backend
- **Golem DB**: Compatible with existing Golem DB integration
- **Biometric Services**: Ready for DNA/fingerprint verification

## 🛠️ Technical Details

### Dependencies
- `@rainbow-me/rainbowkit`: Wallet connection UI
- `wagmi`: React hooks for Ethereum
- `viem`: TypeScript interface for Ethereum
- `@tanstack/react-query`: Data fetching and caching

### Files Modified
- `src/app/layout.tsx`: Added RainbowKit provider
- `src/lib/rainbowkit-provider.tsx`: Wagmi configuration
- `src/app/(app)/wallet/page.tsx`: Wallet interface
- `src/app/(app)/wallet/_components/connect-wallet-modal.tsx`: Connection modal

## 🎨 UI Components

- **ConnectButton**: RainbowKit's built-in connection button
- **Wallet Dashboard**: Balance, address, and actions
- **Transaction History**: Mock transaction display
- **Send/Receive**: Wallet functionality (UI ready)

## 🔒 Security

- All wallet operations handled client-side
- No private keys stored in frontend
- Secure RPC connections via Alchemy
- CORS configured for API calls

---

**Ready for production deployment!** 🚀
