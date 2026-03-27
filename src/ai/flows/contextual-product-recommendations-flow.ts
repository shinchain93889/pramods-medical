'use server';
/**
 * @fileOverview A Genkit flow for providing contextual product recommendations.
 *
 * - contextualProductRecommendations - A function that generates product recommendations based on user context.
 * - ContextualProductRecommendationsInput - The input type for the contextualProductRecommendations function.
 * - ContextualProductRecommendationsOutput - The return type for the contextualProductRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContextualProductRecommendationsInputSchema = z.object({
  currentProduct: z
    .string()
    .optional()
    .describe('The name of the product the user is currently viewing.'),
  cartItems: z
    .array(z.string())
    .optional()
    .describe('A list of product names currently in the user\'s shopping cart.'),
  browsingHistory: z
    .array(z.string())
    .optional()
    .describe('A list of product names the user has recently viewed.'),
  allAvailableProducts: z
    .array(z.string())
    .describe('A comprehensive list of all product names available in the store.'),
});

export type ContextualProductRecommendationsInput = z.infer<
  typeof ContextualProductRecommendationsInputSchema
>;

const ContextualProductRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        productName: z
          .string()
          .describe('The name of the recommended product.'),
        reason: z
          .string()
          .describe('A brief explanation of why this product is recommended.'),
      })
    )
    .describe('A list of recommended products with reasons for each recommendation.'),
});

export type ContextualProductRecommendationsOutput = z.infer<
  typeof ContextualProductRecommendationsOutputSchema
>;

export async function contextualProductRecommendations(
  input: ContextualProductRecommendationsInput
): Promise<ContextualProductRecommendationsOutput> {
  return contextualProductRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualProductRecommendationsPrompt',
  input: { schema: ContextualProductRecommendationsInputSchema },
  output: { schema: ContextualProductRecommendationsOutputSchema },
  prompt: `You are an intelligent product recommendation system for "Pramod Medical Store". Your goal is to suggest complementary items or popular product combinations to enhance a user's well-being, based on their current context.

Here is the list of all available products in the store:
{{#each allAvailableProducts}}- {{{this}}}
{{/each}}

Consider the following user context:
{{#if currentProduct}}
- User is currently viewing: "{{{currentProduct}}}"
{{/if}}
{{#if cartItems.length}}
- User's cart contains: {{#each cartItems}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if browsingHistory.length}}
- User's recent browsing history includes: {{#each browsingHistory}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

Based on this context and the available products, recommend 1 to 3 relevant products that complement the user's current interests or cart items. For each recommendation, provide a brief reason why it's a good suggestion.
Ensure the recommended products are *only* from the 'allAvailableProducts' list provided. Do not invent new products.`,
});

const contextualProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'contextualProductRecommendationsFlow',
    inputSchema: ContextualProductRecommendationsInputSchema,
    outputSchema: ContextualProductRecommendationsOutputSchema,
  },
  async (input) => {
    try {
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        console.warn('No GEMINI_API_KEY provided. Using fallback AI recommendations.');
        throw new Error('Missing API Key');
      }
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.warn('AI Recommendation feature encountered an error. Returning fallback items.');
      return {
        recommendations: [
          {
            productName: 'General Wellness Supplement',
            reason: 'Recommended to support overall health while AI features are unconfigured.'
          },
          {
            productName: 'First Aid Essentials Kit',
            reason: 'Always good to have on hand for minor emergencies.'
          }
        ]
      };
    }
  }
);
