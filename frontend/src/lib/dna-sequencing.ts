/**
 * DNA Sequencing Service
 * Handles communication with the genome device server
 */

import { API_ENDPOINTS } from './config';

export interface DNASequencingRequest {
  user_id: string;
  custodian: string;
  custodian_endpoint: string;
  expiry_time: string;
}

export interface SequencingStatus {
  user_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
  timestamp: string;
  result_file?: string;
}

export class DNASequencingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_ENDPOINTS.GENOME_DEVICE.HEALTH.replace('/health', '');
  }

  /**
   * Check if the genome device server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🏥 Checking genome device health at:', API_ENDPOINTS.GENOME_DEVICE.HEALTH);
      const response = await fetch(API_ENDPOINTS.GENOME_DEVICE.HEALTH, {
        mode: 'cors',
      });
      console.log('🏥 Health check response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('❌ Genome device health check failed:', error);
      console.log('💡 This might be due to mixed content policy (HTTPS -> HTTP)');
      console.log('💡 Try accessing the site via HTTP or allow insecure content in your browser');
      return false;
    }
  }

  /**
   * Start DNA sequencing process
   */
  async startSequencing(request: DNASequencingRequest): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧬 Starting DNA sequencing with request:', request);
      console.log('🌐 Sending to:', API_ENDPOINTS.GENOME_DEVICE.START_SEQUENCING);
      
      const response = await fetch(API_ENDPOINTS.GENOME_DEVICE.START_SEQUENCING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        mode: 'cors', // Explicitly set CORS mode
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Success response:', data);
      return {
        success: true,
        message: data.message || 'DNA sequencing started successfully',
      };
    } catch (error) {
      console.error('❌ Failed to start DNA sequencing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get sequencing status for a user
   */
  async getStatus(userId: string): Promise<SequencingStatus | null> {
    try {
      const response = await fetch(API_ENDPOINTS.GENOME_DEVICE.STATUS(userId));
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No sequencing found
        }
        throw new Error('Failed to get sequencing status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get sequencing status:', error);
      return null;
    }
  }

  /**
   * Poll for status updates (useful for real-time updates)
   */
  async pollStatus(
    userId: string,
    onUpdate: (status: SequencingStatus) => void,
    interval: number = 2000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      const status = await this.getStatus(userId);
      if (status) {
        onUpdate(status);
        
        // Stop polling if completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          isPolling = false;
        }
      }

      if (isPolling) {
        setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Get all sequencing statuses (for debugging)
   */
  async getAllStatuses(): Promise<SequencingStatus[]> {
    try {
      const response = await fetch(API_ENDPOINTS.GENOME_DEVICE.LIST_STATUS);
      
      if (!response.ok) {
        throw new Error('Failed to get all statuses');
      }

      const data = await response.json();
      return data.statuses || [];
    } catch (error) {
      console.error('Failed to get all statuses:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dnaSequencingService = new DNASequencingService();
