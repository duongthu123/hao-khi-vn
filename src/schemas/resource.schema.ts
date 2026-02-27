/**
 * Resource system Zod validation schemas
 * Provides runtime validation for resource data
 */

import { z } from 'zod';

/**
 * Resource type schema
 */
export const ResourceTypeSchema = z.enum(['food', 'gold', 'army']);

/**
 * Resources schema
 * **Validates: Requirements 24.2**
 */
export const ResourcesSchema = z.object({
  food: z.number().nonnegative(),
  gold: z.number().nonnegative(),
  army: z.number().nonnegative()
});

/**
 * Resource caps schema
 */
export const ResourceCapsSchema = z.object({
  food: z.number().positive(),
  gold: z.number().positive(),
  army: z.number().positive()
});

/**
 * Resource generation rates schema
 */
export const ResourceGenerationSchema = z.object({
  foodPerSecond: z.number().nonnegative(),
  goldPerSecond: z.number().nonnegative(),
  armyPerSecond: z.number().nonnegative()
});

/**
 * Resource transaction type schema
 */
export const ResourceTransactionTypeSchema = z.enum(['add', 'subtract', 'set']);

/**
 * Resource transaction schema
 */
export const ResourceTransactionSchema = z.object({
  type: ResourceTransactionTypeSchema,
  resource: ResourceTypeSchema,
  amount: z.number().nonnegative(),
  reason: z.string().min(1),
  timestamp: z.number().int().positive(),
  success: z.boolean()
});

/**
 * Resource cost schema
 */
export const ResourceCostSchema = z.object({
  food: z.number().nonnegative().optional(),
  gold: z.number().nonnegative().optional(),
  army: z.number().nonnegative().optional()
}).refine(
  (data) => data.food !== undefined || data.gold !== undefined || data.army !== undefined,
  {
    message: 'At least one resource cost must be specified',
    path: []
  }
);

/**
 * Resource validation result schema
 */
export const ResourceValidationSchema = z.object({
  valid: z.boolean(),
  missing: ResourcesSchema.partial().optional(),
  message: z.string().optional()
});

// Type inference exports
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type Resources = z.infer<typeof ResourcesSchema>;
export type ResourceCaps = z.infer<typeof ResourceCapsSchema>;
export type ResourceGeneration = z.infer<typeof ResourceGenerationSchema>;
export type ResourceTransactionType = z.infer<typeof ResourceTransactionTypeSchema>;
export type ResourceTransaction = z.infer<typeof ResourceTransactionSchema>;
export type ResourceCost = z.infer<typeof ResourceCostSchema>;
export type ResourceValidation = z.infer<typeof ResourceValidationSchema>;
