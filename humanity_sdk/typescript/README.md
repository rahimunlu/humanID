# Humanity Verification SDK - TypeScript

A TypeScript SDK that allows other companies to integrate with the HumanID network for decentralized human verification services.

## Features

- **First Humanity Verification**: Initiate verification process for new users
- **Humanity Confirmation**: Confirm successful verification of users
- **Blockchain Integration**: Automatic transaction fee handling using organization wallet
- **Comprehensive Error Handling**: Detailed error messages and validation
- **Network Health Monitoring**: Check network status and connectivity
- **TypeScript Support**: Full type safety and IntelliSense support

## Installation

```bash
npm install @humanid/typescript-sdk
```

Or with yarn:

```bash
yarn add @humanid/typescript-sdk
```

## Quick Start

### Basic Usage

```typescript
import { HumanitySDK, firstHumanityVerification, humanityConfirmation, VerificationStatus } from '@humanid/typescript-sdk';

// Initialize SDK
const sdk = new HumanitySDK({
  networkEndpoint: 'https://api.humanid.network',
  timeout: 30000
});

// Your organization's private key (covers transaction fees)
const privateKey = 'your_64_character_hex_private_key';

// First verification
const result = await sdk.firstHumanityVerification({
  privateKey,
  userId: 'user_12345',
  custodian: 'custodian_org',
  custodianServerEndpoint: 'https://custodian.example.com/verify'
});

console.log(`Verification ID: ${result.verificationId}`);
console.log(`Status: ${result.status}`);
console.log(`Transaction Hash: ${result.transactionHash}`);

// Confirm verification
const confirmation = await sdk.humanityConfirmation({
  privateKey,
  userId: 'user_12345',
  custodianServerEndpoint: 'https://custodian.example.com/verify'
});

console.log(`Humanity Score: ${confirmation.humanityScore}`);
console.log(`Status: ${confirmation.status}`);
```

### Using Convenience Functions

```typescript
import { firstHumanityVerification, humanityConfirmation } from '@humanid/typescript-sdk';

// Direct function calls
const result = await firstHumanityVerification({
  privateKey: 'your_private_key',
  userId: 'user_12345',
  custodian: 'custodian_org',
  custodianServerEndpoint: 'https://custodian.example.com/verify'
});

const confirmation = await humanityConfirmation({
  privateKey: 'your_private_key',
  userId: 'user_12345',
  custodianServerEndpoint: 'https://custodian.example.com/verify'
});
```

## API Reference

### HumanitySDK Class

#### Constructor

```typescript
new HumanitySDK(config?: HumanitySDKConfig)
```

**Configuration Options:**
- `networkEndpoint` (string, optional): Base URL for the HumanID network API (default: 'https://api.humanid.network')
- `custodianEndpoint` (string, optional): Custodian server endpoint
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `apiKey` (string, optional): API key for authentication

#### Methods

##### firstHumanityVerification()

Initiates the first humanity verification for a user.

```typescript
async firstHumanityVerification(request: FirstVerificationRequest): Promise<VerificationResult>
```

**Parameters:**
- `request.privateKey` (string): Organization wallet private key (64-character hex string)
- `request.userId` (string): Unique identifier for the user (3-100 characters)
- `request.custodian` (string): Custodian identifier for the verification
- `request.custodianServerEndpoint` (string): Endpoint where custodian will handle verification

**Returns:** `Promise<VerificationResult>`

**Throws:**
- `ValidationError`: If input parameters are invalid
- `NetworkError`: If network request fails
- `BlockchainError`: If blockchain transaction fails

##### humanityConfirmation()

Confirms humanity verification for a user.

```typescript
async humanityConfirmation(request: ConfirmationRequest): Promise<VerificationResult>
```

**Parameters:**
- `request.privateKey` (string): Organization wallet private key (64-character hex string)
- `request.userId` (string): Unique identifier for the user (3-100 characters)
- `request.custodianServerEndpoint` (string): Endpoint where custodian handled verification

**Returns:** `Promise<VerificationResult>`

**Throws:**
- `ValidationError`: If input parameters are invalid
- `NetworkError`: If network request fails
- `BlockchainError`: If blockchain transaction fails

##### getVerificationStatus()

Gets verification status for a user.

```typescript
async getVerificationStatus(userId: string): Promise<VerificationStatusResponse>
```

**Parameters:**
- `userId` (string): Unique identifier for the user

**Returns:** `Promise<VerificationStatusResponse>`

##### healthCheck()

Checks if the HumanID network is healthy and accessible.

```typescript
async healthCheck(): Promise<HealthStatus>
```

**Returns:** `Promise<HealthStatus>`

### Types

#### VerificationResult

Represents the result of a verification request.

```typescript
interface VerificationResult {
  verificationId: string;
  userId: string;
  status: VerificationStatus;
  humanityScore?: number;
  transactionHash?: string;
  timestamp?: string;
  errorMessage?: string;
}
```

#### VerificationStatus

Represents possible verification statuses:

```typescript
enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}
```

#### Error Classes

- `HumanitySDKError`: Base exception for all SDK errors
- `ValidationError`: Input validation errors
- `NetworkError`: Network-related errors
- `BlockchainError`: Blockchain transaction errors

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { HumanitySDK, ValidationError, NetworkError, BlockchainError } from '@humanid/typescript-sdk';

const sdk = new HumanitySDK();

try {
  const result = await sdk.firstHumanityVerification({
    privateKey: 'invalid_key',
    userId: 'user_123',
    custodian: 'custodian',
    custodianServerEndpoint: 'https://example.com'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Validation error: ${error.message}`);
  } else if (error instanceof NetworkError) {
    console.log(`Network error: ${error.message}`);
  } else if (error instanceof BlockchainError) {
    console.log(`Blockchain error: ${error.message}`);
  } else {
    console.log(`Unexpected error: ${error}`);
  }
}
```

## Examples

### Complete Verification Flow

```typescript
import { HumanitySDK, VerificationStatus } from '@humanid/typescript-sdk';

async function verifyUser() {
  // Initialize SDK
  const sdk = new HumanitySDK({
    networkEndpoint: 'https://api.humanid.network'
  });

  // Your organization's private key
  const privateKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';

  try {
    // Step 1: Initiate verification
    console.log('Initiating verification...');
    const verification = await sdk.firstHumanityVerification({
      privateKey,
      userId: 'user_12345',
      custodian: 'trusted_custodian',
      custodianServerEndpoint: 'https://custodian.example.com/verify'
    });

    if (verification.status === VerificationStatus.PENDING) {
      console.log(`Verification initiated: ${verification.verificationId}`);
      console.log(`Transaction hash: ${verification.transactionHash}`);
      
      // Step 2: Wait for custodian to process (in real scenario)
      // ... custodian processes verification ...
      
      // Step 3: Confirm verification
      console.log('Confirming verification...');
      const confirmation = await sdk.humanityConfirmation({
        privateKey,
        userId: 'user_12345',
        custodianServerEndpoint: 'https://custodian.example.com/verify'
      });
      
      if (confirmation.status === VerificationStatus.VERIFIED) {
        console.log(`User verified! Humanity score: ${confirmation.humanityScore}`);
      } else {
        console.log(`Verification failed: ${confirmation.errorMessage}`);
      }
    } else {
      console.log(`Verification failed: ${verification.errorMessage}`);
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
}
```

### Health Check

```typescript
import { HumanitySDK } from '@humanid/typescript-sdk';

async function checkHealth() {
  const sdk = new HumanitySDK();

  // Check network health
  const health = await sdk.healthCheck();
  console.log(`Network status: ${health.status}`);

  if (health.status === 'healthy') {
    console.log('Network is operational');
  } else {
    console.log(`Network issue: ${health.error}`);
  }
}
```

### Get User Status

```typescript
import { HumanitySDK } from '@humanid/typescript-sdk';

async function getUserStatus() {
  const sdk = new HumanitySDK();

  // Get verification status for a user
  const status = await sdk.getVerificationStatus('user_12345');
  console.log(`User verifications: ${status.count}`);

  for (const verification of status.verifications) {
    console.log(`Verification ID: ${verification.verificationId}`);
    console.log(`Type: ${verification.verificationType}`);
    console.log(`Score: ${verification.humanityScore || 'N/A'}`);
    console.log(`Timestamp: ${verification.timestamp}`);
  }
}
```

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Testing

```bash
npm test
```

## Security Considerations

1. **Private Key Security**: Never hardcode private keys in your source code. Use environment variables or secure key management systems.

2. **Network Security**: Always use HTTPS endpoints for production environments.

3. **Input Validation**: The SDK validates all inputs, but you should also validate user inputs before passing them to the SDK.

4. **Error Handling**: Implement proper error handling to avoid exposing sensitive information in error messages.

## Environment Variables

You can configure the SDK using environment variables:

```bash
export HUMANID_NETWORK_ENDPOINT="https://api.humanid.network"
export HUMANID_CUSTODIAN_ENDPOINT="https://custodian.example.com"
export HUMANID_TIMEOUT="30000"
export HUMANID_API_KEY="your_api_key"
```

## License

This SDK is part of the HumanID project. Please refer to the main project license for usage terms.

## Support

For support and questions, please contact the HumanID team or refer to the main project documentation.
