/**
 * Humanity Verification SDK - TypeScript
 * Allows other companies to request humanity verification using the HumanID network
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/**
 * Verification status enumeration
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Result of a verification request
 */
export interface VerificationResult {
  verificationId: string;
  userId: string;
  status: VerificationStatus;
  humanityScore?: number;
  transactionHash?: string;
  timestamp?: string;
  errorMessage?: string;
}

/**
 * Configuration options for the SDK
 */
export interface HumanitySDKConfig {
  networkEndpoint?: string;
  custodianEndpoint?: string;
  timeout?: number;
  apiKey?: string;
}

/**
 * Verification request data
 */
export interface FirstVerificationRequest {
  privateKey: string;
  userId: string;
  custodian: string;
  custodianServerEndpoint: string;
}

export interface ConfirmationRequest {
  privateKey: string;
  userId: string;
  custodianServerEndpoint: string;
}

/**
 * Custom error classes
 */
export class HumanitySDKError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'HumanitySDKError';
  }
}

export class ValidationError extends HumanitySDKError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends HumanitySDKError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class BlockchainError extends HumanitySDKError {
  constructor(message: string) {
    super(message, 'BLOCKCHAIN_ERROR');
    this.name = 'BlockchainError';
  }
}

/**
 * Humanity Verification SDK
 */
export class HumanitySDK {
  private readonly client: AxiosInstance;
  private readonly config: Required<HumanitySDKConfig>;

  constructor(config: HumanitySDKConfig = {}) {
    this.config = {
      networkEndpoint: config.networkEndpoint || 'https://api.humanid.network',
      custodianEndpoint: config.custodianEndpoint || '',
      timeout: config.timeout || 30000,
      apiKey: config.apiKey || ''
    };

    this.client = axios.create({
      baseURL: this.config.networkEndpoint,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HumanitySDK-TypeScript/1.0.0',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new NetworkError(`Request timed out after ${this.config.timeout}ms`);
        }
        if (error.response) {
          const errorMessage = error.response.data?.error || error.message;
          throw new NetworkError(`HTTP ${error.response.status}: ${errorMessage}`);
        }
        if (error.request) {
          throw new NetworkError('Network request failed - no response received');
        }
        throw new NetworkError(`Request failed: ${error.message}`);
      }
    );
  }

  /**
   * Validate private key format
   */
  private validatePrivateKey(privateKey: string): void {
    if (!privateKey || typeof privateKey !== 'string') {
      throw new ValidationError('Private key must be a non-empty string');
    }

    if (privateKey.length !== 64) {
      throw new ValidationError('Private key must be 64 characters (32 bytes)');
    }

    if (!/^[0-9a-fA-F]+$/.test(privateKey)) {
      throw new ValidationError('Private key must be a valid hexadecimal string');
    }
  }

  /**
   * Validate user ID format
   */
  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID must be a non-empty string');
    }

    if (userId.length < 3 || userId.length > 100) {
      throw new ValidationError('User ID must be between 3 and 100 characters');
    }
  }

  /**
   * Validate custodian format
   */
  private validateCustodian(custodian: string): void {
    if (!custodian || typeof custodian !== 'string') {
      throw new ValidationError('Custodian must be a non-empty string');
    }
  }

  /**
   * Sign transaction data with private key
   */
  private signTransaction(privateKey: string, data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');
    
    // Simulate transaction hash generation
    const transactionData = `${privateKey.substring(0, 8)}${dataHash.substring(0, 8)}${Date.now()}`;
    return crypto.createHash('sha256').update(transactionData).digest('hex');
  }

  /**
   * Make HTTP request to the network
   */
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      if (error instanceof HumanitySDKError) {
        throw error;
      }
      throw new NetworkError(`Request failed: ${error}`);
    }
  }

  /**
   * Initiate first humanity verification for a user
   */
  async firstHumanityVerification(request: FirstVerificationRequest): Promise<VerificationResult> {
    try {
      // Validate inputs
      this.validatePrivateKey(request.privateKey);
      this.validateUserId(request.userId);
      this.validateCustodian(request.custodian);

      if (!request.custodianServerEndpoint || typeof request.custodianServerEndpoint !== 'string') {
        throw new ValidationError('Custodian server endpoint must be a non-empty string');
      }

      // Generate verification ID
      const verificationId = uuidv4();
      const timestamp = new Date().toISOString();

      // Prepare verification data
      const verificationData = {
        verificationId,
        userId: request.userId,
        custodian: request.custodian,
        custodianServerEndpoint: request.custodianServerEndpoint,
        timestamp,
        verificationType: 'first_humanity_verification',
        organizationWallet: `${request.privateKey.substring(0, 8)}...${request.privateKey.substring(56)}`
      };

      // Sign the transaction
      const transactionHash = this.signTransaction(request.privateKey, verificationData);

      // Add transaction hash to data
      const requestData = {
        ...verificationData,
        transactionHash
      };

      // Make request to network
      const response = await this.makeRequest<{
        success: boolean;
        verificationId?: string;
        error?: string;
      }>('/api/v1/verification/initiate', requestData);

      if (response.success) {
        return {
          verificationId,
          userId: request.userId,
          status: VerificationStatus.PENDING,
          transactionHash,
          timestamp
        };
      } else {
        return {
          verificationId,
          userId: request.userId,
          status: VerificationStatus.REJECTED,
          errorMessage: response.error || 'Unknown error occurred',
          timestamp
        };
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error;
      }
      throw new HumanitySDKError(`Unexpected error during verification: ${error}`);
    }
  }

  /**
   * Confirm humanity verification for a user
   */
  async humanityConfirmation(request: ConfirmationRequest): Promise<VerificationResult> {
    try {
      // Validate inputs
      this.validatePrivateKey(request.privateKey);
      this.validateUserId(request.userId);

      if (!request.custodianServerEndpoint || typeof request.custodianServerEndpoint !== 'string') {
        throw new ValidationError('Custodian server endpoint must be a non-empty string');
      }

      // Generate confirmation ID
      const confirmationId = uuidv4();
      const timestamp = new Date().toISOString();

      // Prepare confirmation data
      const confirmationData = {
        confirmationId,
        userId: request.userId,
        custodianServerEndpoint: request.custodianServerEndpoint,
        timestamp,
        confirmationType: 'humanity_confirmation',
        organizationWallet: `${request.privateKey.substring(0, 8)}...${request.privateKey.substring(56)}`
      };

      // Sign the transaction
      const transactionHash = this.signTransaction(request.privateKey, confirmationData);

      // Add transaction hash to data
      const requestData = {
        ...confirmationData,
        transactionHash
      };

      // Make request to network
      const response = await this.makeRequest<{
        success: boolean;
        humanityScore?: number;
        error?: string;
      }>('/api/v1/verification/confirm', requestData);

      if (response.success) {
        return {
          verificationId: confirmationId,
          userId: request.userId,
          status: VerificationStatus.VERIFIED,
          humanityScore: response.humanityScore,
          transactionHash,
          timestamp
        };
      } else {
        return {
          verificationId: confirmationId,
          userId: request.userId,
          status: VerificationStatus.REJECTED,
          errorMessage: response.error || 'Unknown error occurred',
          timestamp
        };
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error;
      }
      throw new HumanitySDKError(`Unexpected error during confirmation: ${error}`);
    }
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<{
    userId: string;
    verifications: Array<{
      verificationId: string;
      verificationType: string;
      humanityScore?: number;
      timestamp: string;
      fileHash?: string;
    }>;
    count: number;
  }> {
    try {
      this.validateUserId(userId);

      const response = await this.makeRequest<{
        userId: string;
        verifications: Array<{
          verificationId: string;
          verificationType: string;
          humanityScore?: number;
          timestamp: string;
          fileHash?: string;
        }>;
        count: number;
      }>(`/api/v1/verification/status/${userId}`, {});

      return response;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NetworkError) {
        throw error;
      }
      throw new HumanitySDKError(`Unexpected error getting status: ${error}`);
    }
  }

  /**
   * Check if the HumanID network is healthy and accessible
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service?: string;
    error?: string;
  }> {
    try {
      const response = await this.makeRequest<{
        status: string;
        timestamp: string;
        service?: string;
      }>('/health', {});
      return response;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Convenience functions for direct usage
 */
export function createSDK(config?: HumanitySDKConfig): HumanitySDK {
  return new HumanitySDK(config);
}

export async function firstHumanityVerification(
  request: FirstVerificationRequest,
  config?: HumanitySDKConfig
): Promise<VerificationResult> {
  const sdk = new HumanitySDK(config);
  return sdk.firstHumanityVerification(request);
}

export async function humanityConfirmation(
  request: ConfirmationRequest,
  config?: HumanitySDKConfig
): Promise<VerificationResult> {
  const sdk = new HumanitySDK(config);
  return sdk.humanityConfirmation(request);
}

// Default export
export default HumanitySDK;
