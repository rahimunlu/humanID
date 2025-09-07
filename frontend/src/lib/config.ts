/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base URLs for different services
export const API_CONFIG = {
  // Biometrics server (existing)
  BIOMETRICS_SERVER: typeof window !== 'undefined' 
    ? (window as any).ENV?.NEXT_PUBLIC_BIOMETRICS_SERVER_URL || 'https://biometrics-server.biokami.com'
    : 'https://biometrics-server.biokami.com',
  
  // Genome device server (new) - Physical device on local network
  // Direct connection from browser to local Raspberry Pi (HTTP)
  GENOME_DEVICE: typeof window !== 'undefined'
    ? (window as any).ENV?.NEXT_PUBLIC_GENOME_DEVICE_URL || 'https://3054cc94ecee.ngrok-free.app'
    : 'https://3054cc94ecee.ngrok-free.app',
  
  // HumanID backend (existing) - NOT USED ANYMORE, DIRECT GOLEM DB CONNECTION
  HUMANID_BACKEND: typeof window !== 'undefined'
    ? (window as any).ENV?.NEXT_PUBLIC_HUMANID_BACKEND_BASE || 'https://api.humanid.biokami.com'
    : 'https://api.humanid.biokami.com',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Biometrics endpoints
  BIOMETRICS: {
    HEALTH: `${API_CONFIG.BIOMETRICS_SERVER}/health`,
    FIRST_VERIFICATION: `${API_CONFIG.BIOMETRICS_SERVER}/first_humanity_verification`,
    SIMILARITY_CHECK: `${API_CONFIG.BIOMETRICS_SERVER}/similarity_check`,
    VERIFICATION_STATUS: (userId: string) => `${API_CONFIG.BIOMETRICS_SERVER}/verification_status/${userId}`,
    DOCS: `${API_CONFIG.BIOMETRICS_SERVER}/docs`,
  },
  
  // Genome device endpoints
  GENOME_DEVICE: {
    HEALTH: `${API_CONFIG.GENOME_DEVICE}/health`,
    START_SEQUENCING: `${API_CONFIG.GENOME_DEVICE}/start_sequencing`,
    STATUS: (userId: string) => `${API_CONFIG.GENOME_DEVICE}/status/${userId}`,
    LIST_STATUS: `${API_CONFIG.GENOME_DEVICE}/list_status`,
  },
  
  // HumanID backend endpoints
  HUMANID: {
    BASE: API_CONFIG.HUMANID_BACKEND,
  },
} as const;

// Environment check
export const isDevelopment = typeof window !== 'undefined' 
  ? (window as any).ENV?.NODE_ENV === 'development'
  : false;
export const isProduction = typeof window !== 'undefined'
  ? (window as any).ENV?.NODE_ENV === 'production'
  : true;

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', API_CONFIG);
}
