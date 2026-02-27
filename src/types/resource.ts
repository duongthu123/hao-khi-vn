/**
 * Resource system types
 * Defines resources, caps, generation, and transactions
 */

/**
 * Resource type enum
 */
export enum ResourceType {
  FOOD = 'food',
  GOLD = 'gold',
  ARMY = 'army'
}

/**
 * Resources interface
 */
export interface Resources {
  food: number;
  gold: number;
  army: number;
}

/**
 * Resource caps interface
 */
export interface ResourceCaps {
  food: number;
  gold: number;
  army: number;
}

/**
 * Resource generation rates interface
 */
export interface ResourceGeneration {
  foodPerSecond: number;
  goldPerSecond: number;
  armyPerSecond: number;
}

/**
 * Resource transaction type enum
 */
export enum ResourceTransactionType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set'
}

/**
 * Resource transaction interface
 */
export interface ResourceTransaction {
  type: ResourceTransactionType;
  resource: ResourceType;
  amount: number;
  reason: string;
  timestamp: number;
  success: boolean;
}

/**
 * Resource cost interface for purchases
 */
export interface ResourceCost {
  food?: number;
  gold?: number;
  army?: number;
}

/**
 * Resource validation result
 */
export interface ResourceValidation {
  valid: boolean;
  missing?: Partial<Resources>;
  message?: string;
}
