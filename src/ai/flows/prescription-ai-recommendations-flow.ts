'use server';
/**
 * @fileOverview This file defines a Genkit flow for identifying prescribed medicines from an image
 * and suggesting matching products from the store inventory.
 *
 * - prescribeAiRecommendations - A function that handles the prescription analysis and product suggestion process.
 * - PrescriptionAiRecommendationsInput - The input type for the prescribeAiRecommendations function.
 * - PrescriptionAiRecommendationsOutput - The return type for the prescribeAiRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrescriptionAiRecommendationsInputSchema = z.object({
  prescriptionImageDataUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  storeInventory: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier of the product.'),
        name: z.string().describe('The name of the product.'),
        price: z.number().describe('The price of the product.'),
        // Add other relevant product fields if necessary, e.g., 'category'
      })
    )
    .describe('A list of products currently available in the store.'),
});
export type PrescriptionAiRecommendationsInput = z.infer<
  typeof PrescriptionAiRecommendationsInputSchema
>;

const IdentifiedMedicinesSchema = z.object({
  identifiedMedicines: z
    .array(z.string())
    .describe('A list of medicine names identified from the prescription.'),
});

const PrescriptionAiRecommendationsOutputSchema = z.object({
  suggestedProducts: z
    .array(
      z.object({
        id: z.string().describe('The unique identifier of the product.'),
        name: z.string().describe('The name of the product.'),
        price: z.number().describe('The price of the product.'),
      })
    )
    .describe(
      'A list of suggested products from the store inventory matching the identified medicines.'
    ),
});
export type PrescriptionAiRecommendationsOutput = z.infer<
  typeof PrescriptionAiRecommendationsOutputSchema
>;

export async function prescribeAiRecommendations(
  input: PrescriptionAiRecommendationsInput
): Promise<PrescriptionAiRecommendationsOutput> {
  return prescriptionAiRecommendationsFlow(input);
}

const identifyMedicinesPrompt = ai.definePrompt({
  name: 'identifyMedicinesPrompt',
  input: {schema: PrescriptionAiRecommendationsInputSchema},
  output: {schema: IdentifiedMedicinesSchema},
  prompt: `You are an expert at reading medical prescriptions and identifying medicine names.

Analyze the provided prescription image and list all the prescribed medicine names. Focus only on the medicine names.
Do not include dosages, frequencies, or patient information. Only return the names of the medicines.

Prescription Image: {{media url=prescriptionImageDataUri}}
`,
});

const prescriptionAiRecommendationsFlow = ai.defineFlow(
  {
    name: 'prescriptionAiRecommendationsFlow',
    inputSchema: PrescriptionAiRecommendationsInputSchema,
    outputSchema: PrescriptionAiRecommendationsOutputSchema,
  },
  async input => {
    try {
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        throw new Error('Missing API Key');
      }
      
      const {output} = await identifyMedicinesPrompt(input);

      if (!output || !output.identifiedMedicines) {
        return {suggestedProducts: []};
      }

      const identifiedMedicinesLower = output.identifiedMedicines.map(name =>
        name.toLowerCase()
      );
      const suggestedProducts: typeof PrescriptionAiRecommendationsOutputSchema._type['suggestedProducts'] = [];

      // Simple matching logic: find store products whose names (case-insensitive) include any identified medicine name.
      // A more sophisticated matching could involve fuzzy matching or a dedicated search service.
      for (const medicineName of identifiedMedicinesLower) {
        const matchingProducts = input.storeInventory.filter(product =>
          product.name.toLowerCase().includes(medicineName)
        );
        suggestedProducts.push(...matchingProducts);
      }

      // Remove duplicates based on product id
      const uniqueSuggestedProducts = Array.from(
        new Map(suggestedProducts.map(product => [product.id, product])).values()
      );

      return {suggestedProducts: uniqueSuggestedProducts};
    } catch (error) {
      console.warn('Prescription AI Identification encountered an error. Returning empty suggestions.', error);
      return {suggestedProducts: []};
    }
  }
);
