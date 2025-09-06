"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dnaSequencingService, DNASequencingRequest, SequencingStatus } from "@/lib/dna-sequencing";

interface DNASequencingButtonProps {
  userId: string;
  custodian: string;
  custodianEndpoint: string;
  expiryTime: string;
  onStatusUpdate?: (status: SequencingStatus) => void;
}

export function DNASequencingButton({
  userId,
  custodian,
  custodianEndpoint,
  expiryTime,
  onStatusUpdate
}: DNASequencingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SequencingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartSequencing = async () => {
    if (!userId) {
      setError("Wallet address is required to start DNA sequencing");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: DNASequencingRequest = {
        user_id: userId,
        custodian,
        custodian_endpoint: custodianEndpoint,
        expiry_time: expiryTime,
      };

      const result = await dnaSequencingService.startSequencing(request);
      
      if (result.success) {
        // Start polling for status updates
        const stopPolling = await dnaSequencingService.pollStatus(
          userId,
          (newStatus) => {
            setStatus(newStatus);
            onStatusUpdate?.(newStatus);
          }
        );

        // Store stop function for cleanup if needed
        (window as any).stopDNASequencingPolling = stopPolling;
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!status) return "🧬";
    
    switch (status.status) {
      case 'completed':
        return "✅";
      case 'failed':
        return "❌";
      case 'processing':
        return "⏳";
      case 'queued':
        return "⏰";
      default:
        return "🧬";
    }
  };

  const getStatusColor = () => {
    if (!status) return "default";
    
    switch (status.status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'queued':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{getStatusIcon()}</span>
          DNA Sequencing
        </CardTitle>
        <CardDescription>
          Start DNA analysis and verification process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor()}>
                {status.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {status.message}
            </p>
            {status.result_file && (
              <p className="text-xs text-muted-foreground">
                Result file: {status.result_file}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleStartSequencing}
          disabled={!userId || isLoading || status?.status === 'processing' || status?.status === 'completed'}
          className="w-full"
        >
          {isLoading ? (
            <>
              <span className="mr-2">⏳</span>
              Starting...
            </>
          ) : status?.status === 'completed' ? (
            <>
              <span className="mr-2">✅</span>
              Completed
            </>
          ) : status?.status === 'processing' ? (
            <>
              <span className="mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <span className="mr-2">🧬</span>
              Start DNA Sequencing
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>User ID:</strong> {userId}</p>
          <p><strong>Custodian:</strong> {custodian}</p>
          <p><strong>Endpoint:</strong> {custodianEndpoint}</p>
          <p><strong>Expiry:</strong> {expiryTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}
