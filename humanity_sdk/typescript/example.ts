/**
 * Example usage of the Humanity Verification SDK - TypeScript
 */

import { HumanitySDK, firstHumanityVerification, humanityConfirmation, VerificationStatus } from './src/index';

async function main(): Promise<void> {
  // Example private key (in production, use environment variables)
  const privateKey = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
  
  // Example user data
  const userId = 'user_12345';
  const custodian = 'trusted_custodian';
  const custodianEndpoint = 'https://custodian.example.com/verify';
  
  console.log('=== Humanity Verification SDK Example (TypeScript) ===\n');
  
  // Method 1: Using SDK class
  console.log('1. Using HumanitySDK class:');
  const sdk = new HumanitySDK({
    networkEndpoint: 'https://api.humanid.network',
    timeout: 30000
  });
  
  try {
    // Health check
    const health = await sdk.healthCheck();
    console.log(`   Network health: ${health.status}`);
    
    // First verification
    console.log('   Initiating first verification...');
    const verification = await sdk.firstHumanityVerification({
      privateKey,
      userId,
      custodian,
      custodianServerEndpoint: custodianEndpoint
    });
    
    console.log(`   Verification ID: ${verification.verificationId}`);
    console.log(`   Status: ${verification.status}`);
    console.log(`   Transaction Hash: ${verification.transactionHash}`);
    
    if (verification.status === VerificationStatus.PENDING) {
      // Humanity confirmation
      console.log('   Confirming verification...');
      const confirmation = await sdk.humanityConfirmation({
        privateKey,
        userId,
        custodianServerEndpoint: custodianEndpoint
      });
      
      console.log(`   Confirmation ID: ${confirmation.verificationId}`);
      console.log(`   Status: ${confirmation.status}`);
      console.log(`   Humanity Score: ${confirmation.humanityScore}`);
    }
    
    // Get verification status
    console.log('   Getting verification status...');
    const status = await sdk.getVerificationStatus(userId);
    console.log(`   User has ${status.count} verifications`);
    
  } catch (error) {
    console.log(`   Error: ${error}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Method 2: Using convenience functions
  console.log('2. Using convenience functions:');
  
  try {
    // Direct function calls
    const verification = await firstHumanityVerification({
      privateKey,
      userId: 'user_67890',
      custodian,
      custodianServerEndpoint: custodianEndpoint
    });
    
    console.log(`   Verification ID: ${verification.verificationId}`);
    console.log(`   Status: ${verification.status}`);
    
    const confirmation = await humanityConfirmation({
      privateKey,
      userId: 'user_67890',
      custodianServerEndpoint: custodianEndpoint
    });
    
    console.log(`   Confirmation ID: ${confirmation.verificationId}`);
    console.log(`   Status: ${confirmation.status}`);
    console.log(`   Humanity Score: ${confirmation.humanityScore}`);
    
  } catch (error) {
    console.log(`   Error: ${error}`);
  }
  
  console.log('\n=== Example completed ===');
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
