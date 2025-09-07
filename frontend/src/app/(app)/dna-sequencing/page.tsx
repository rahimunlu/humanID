"use client";

import { useState, useEffect } from "react";
import { DNASequencingButton } from "@/components/dna-sequencing-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SequencingStatus } from "@/lib/dna-sequencing";
import { useAccount } from "wagmi";

export default function DNASequencingPage() {
  const { address, isConnected } = useAccount();
  const [currentStatus, setCurrentStatus] = useState<SequencingStatus | null>(null);

  // Fixed configuration values
  const custodian = "biokami_labs";
  const custodianEndpoint = "https://biometrics-server.biokami.com";
  
  // Set expiry to one year from now
  const getExpiryTime = () => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return oneYearFromNow.toISOString();
  };
  
  const expiryTime = getExpiryTime();
  const userId = address || ""; // Use wallet address as user_id

  const handleStatusUpdate = (status: SequencingStatus) => {
    setCurrentStatus(status);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">DNA Sequencing</h1>
        <p className="text-muted-foreground">
          Start DNA analysis for human verification using your connected wallet
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <div className="text-6xl">🔗</div>
              <h3 className="text-xl font-semibold">Wallet Not Connected</h3>
              <p className="text-muted-foreground">
                Please connect your MetaMask wallet to start DNA sequencing
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Display */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                DNA sequencing parameters (automatically configured)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID (Wallet Address)</label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  {userId || "Not connected"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custodian</label>
                <div className="p-3 bg-muted rounded-md">
                  {custodian}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custodian Endpoint</label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {custodianEndpoint}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Time</label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  {new Date(expiryTime).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DNA Sequencing Component */}
          <DNASequencingButton
            userId={userId}
            custodian={custodian}
            custodianEndpoint={custodianEndpoint}
            expiryTime={expiryTime}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      )}

      {/* Status Display */}
      {currentStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Real-time DNA sequencing status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-muted-foreground">{currentStatus.user_id}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-muted-foreground">{currentStatus.status}</p>
                </div>
                <div>
                  <span className="font-medium">Message:</span>
                  <p className="text-muted-foreground">{currentStatus.message}</p>
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <p className="text-muted-foreground">
                    {new Date(currentStatus.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {currentStatus.result_file && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium">Result File:</span>
                    <p className="text-muted-foreground font-mono text-xs">
                      {currentStatus.result_file}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>
            Genome device server endpoints and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Server URL:</span>
              <p className="text-muted-foreground font-mono">
                https://3054cc94ecee.ngrok-free.app
              </p>
            </div>
            <div>
              <span className="font-medium">Health Check:</span>
              <p className="text-muted-foreground font-mono">
                GET /health
              </p>
            </div>
            <div>
              <span className="font-medium">Start Sequencing:</span>
              <p className="text-muted-foreground font-mono">
                POST /start_sequencing
              </p>
            </div>
            <div>
              <span className="font-medium">Check Status:</span>
              <p className="text-muted-foreground font-mono">
                GET /status/{`{user_id}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
