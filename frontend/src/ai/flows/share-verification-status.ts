'use server';

/**
 * @fileOverview Flow for generating a shareable code or deeplink to share verification status.
 *
 * - shareVerificationStatus - A function that generates a shareable code or deeplink.
 * - ShareVerificationStatusInput - The input type for the shareVerificationStatus function.
 * - ShareVerificationStatusOutput - The return type for the shareVerificationStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShareVerificationStatusInputSchema = z.object({
  walletAddress: z.string().describe('The user\'s wallet address.'),
});
export type ShareVerificationStatusInput = z.infer<typeof ShareVerificationStatusInputSchema>;

const ShareVerificationStatusOutputSchema = z.object({
  shareableCode: z.string().describe('The generated shareable code or deeplink.'),
});
export type ShareVerificationStatusOutput = z.infer<typeof ShareVerificationStatusOutputSchema>;

export async function shareVerificationStatus(input: ShareVerificationStatusInput): Promise<ShareVerificationStatusOutput> {
  return shareVerificationStatusFlow(input);
}

const shareVerificationStatusPrompt = ai.definePrompt({
  name: 'shareVerificationStatusPrompt',
  input: {schema: ShareVerificationStatusInputSchema},
  output: {schema: ShareVerificationStatusOutputSchema},
  prompt: `You are a tool that generates a shareable code or deeplink for a user's verification status.

  Given the user's wallet address: {{{walletAddress}}},
  generate a short, unique shareable code that can be used to verify their identity.
  The shareable code should be short and easy to share.
  Alternatively, you can generate a deeplink that directly opens the BioChain app with the user's verification status.
  Return the shareable code or deeplink.
  `,
});

const shareVerificationStatusFlow = ai.defineFlow(
  {
    name: 'shareVerificationStatusFlow',
    inputSchema: ShareVerificationStatusInputSchema,
    outputSchema: ShareVerificationStatusOutputSchema,
  },
  async input => {
    const {output} = await shareVerificationStatusPrompt(input);
    return output!;
  }
);
