/**
 * Resource Manager
 * Core logic for managing resource transactions with validation and atomic operations
 */

import {
  Resources,
  ResourceType,
  ResourceTransaction,
  ResourceTransactionType,
  ResourceCost,
  ResourceValidation,
} from '@/types/resource';

/**
 * Transaction log for debugging
 */
const transactionLog: ResourceTransaction[] = [];

/**
 * Maximum transaction log size
 */
const MAX_LOG_SIZE = 100;

/**
 * Add a transaction to the log
 */
function logTransaction(transaction: ResourceTransaction): void {
  transactionLog.push(transaction);
  
  // Keep log size manageable
  if (transactionLog.length > MAX_LOG_SIZE) {
    transactionLog.shift();
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Resource Transaction]', transaction);
  }
}

/**
 * Get transaction log
 */
export function getTransactionLog(): ResourceTransaction[] {
  return [...transactionLog];
}

/**
 * Clear transaction log
 */
export function clearTransactionLog(): void {
  transactionLog.length = 0;
}

/**
 * Validate if resources are sufficient for a cost
 */
export function validateResources(
  current: Resources,
  cost: ResourceCost
): ResourceValidation {
  const missing: Partial<Resources> = {};
  let valid = true;
  
  // Check each resource type
  for (const key in cost) {
    const resourceType = key as keyof Resources;
    const required = cost[resourceType] || 0;
    const available = current[resourceType];
    
    if (available < required) {
      valid = false;
      missing[resourceType] = required - available;
    }
  }
  
  if (!valid) {
    const missingStr = Object.entries(missing)
      .map(([resource, amount]) => `${resource}: ${amount}`)
      .join(', ');
    
    return {
      valid: false,
      missing,
      message: `Insufficient resources. Missing: ${missingStr}`,
    };
  }
  
  return { valid: true };
}

/**
 * Add resources with cap enforcement
 */
export function addResources(
  current: Resources,
  caps: Resources,
  toAdd: Partial<Resources>,
  reason: string = 'Resource addition'
): { resources: Resources; transactions: ResourceTransaction[] } {
  const newResources = { ...current };
  const transactions: ResourceTransaction[] = [];
  
  for (const key in toAdd) {
    const resourceType = key as keyof Resources;
    const amount = toAdd[resourceType] || 0;
    
    if (amount <= 0) continue;
    
    const oldValue = newResources[resourceType];
    const cap = caps[resourceType];
    const newValue = Math.min(oldValue + amount, cap);
    const actualAdded = newValue - oldValue;
    
    newResources[resourceType] = newValue;
    
    const transaction: ResourceTransaction = {
      type: ResourceTransactionType.ADD,
      resource: ResourceType[resourceType.toUpperCase() as keyof typeof ResourceType],
      amount: actualAdded,
      reason,
      timestamp: Date.now(),
      success: true,
    };
    
    transactions.push(transaction);
    logTransaction(transaction);
  }
  
  return { resources: newResources, transactions };
}

/**
 * Subtract resources with validation
 */
export function subtractResources(
  current: Resources,
  toSubtract: ResourceCost,
  reason: string = 'Resource subtraction'
): { resources: Resources; transactions: ResourceTransaction[]; success: boolean } {
  // Validate first
  const validation = validateResources(current, toSubtract);
  
  if (!validation.valid) {
    // Log failed transaction
    for (const key in toSubtract) {
      const resourceType = key as keyof Resources;
      const amount = toSubtract[resourceType] || 0;
      
      const transaction: ResourceTransaction = {
        type: ResourceTransactionType.SUBTRACT,
        resource: ResourceType[resourceType.toUpperCase() as keyof typeof ResourceType],
        amount,
        reason: `${reason} (FAILED: ${validation.message})`,
        timestamp: Date.now(),
        success: false,
      };
      
      logTransaction(transaction);
    }
    
    return { resources: current, transactions: [], success: false };
  }
  
  // Perform subtraction
  const newResources = { ...current };
  const transactions: ResourceTransaction[] = [];
  
  for (const key in toSubtract) {
    const resourceType = key as keyof Resources;
    const amount = toSubtract[resourceType] || 0;
    
    if (amount <= 0) continue;
    
    newResources[resourceType] -= amount;
    
    const transaction: ResourceTransaction = {
      type: ResourceTransactionType.SUBTRACT,
      resource: ResourceType[resourceType.toUpperCase() as keyof typeof ResourceType],
      amount,
      reason,
      timestamp: Date.now(),
      success: true,
    };
    
    transactions.push(transaction);
    logTransaction(transaction);
  }
  
  return { resources: newResources, transactions, success: true };
}

/**
 * Execute an atomic transaction (all or nothing)
 * Useful for complex operations that involve multiple resource changes
 */
export function executeAtomicTransaction(
  current: Resources,
  caps: Resources,
  operations: Array<{
    type: 'add' | 'subtract';
    resources: ResourceCost;
    reason: string;
  }>
): { resources: Resources; transactions: ResourceTransaction[]; success: boolean } {
  // First, validate all subtract operations
  let tempResources = { ...current };
  
  for (const op of operations) {
    if (op.type === 'subtract') {
      const validation = validateResources(tempResources, op.resources);
      if (!validation.valid) {
        // Log failed atomic transaction
        const transaction: ResourceTransaction = {
          type: ResourceTransactionType.SUBTRACT,
          resource: ResourceType.FOOD, // Placeholder
          amount: 0,
          reason: `Atomic transaction failed: ${validation.message}`,
          timestamp: Date.now(),
          success: false,
        };
        logTransaction(transaction);
        
        return { resources: current, transactions: [], success: false };
      }
      
      // Simulate subtraction for validation
      for (const key in op.resources) {
        const resourceType = key as keyof Resources;
        tempResources[resourceType] -= op.resources[resourceType] || 0;
      }
    }
  }
  
  // All validations passed, execute operations
  let resultResources = { ...current };
  const allTransactions: ResourceTransaction[] = [];
  
  for (const op of operations) {
    if (op.type === 'add') {
      const result = addResources(resultResources, caps, op.resources, op.reason);
      resultResources = result.resources;
      allTransactions.push(...result.transactions);
    } else {
      const result = subtractResources(resultResources, op.resources, op.reason);
      resultResources = result.resources;
      allTransactions.push(...result.transactions);
    }
  }
  
  return { resources: resultResources, transactions: allTransactions, success: true };
}

/**
 * Calculate resource cost with modifiers
 */
export function calculateCost(
  baseCost: ResourceCost,
  modifier: number = 1.0
): ResourceCost {
  const cost: ResourceCost = {};
  
  for (const key in baseCost) {
    const resourceType = key as keyof ResourceCost;
    const baseAmount = baseCost[resourceType] || 0;
    cost[resourceType] = Math.ceil(baseAmount * modifier);
  }
  
  return cost;
}

/**
 * Format resources for display
 */
export function formatResources(resources: Partial<Resources>): string {
  const parts: string[] = [];
  
  if (resources.food !== undefined) {
    parts.push(`Food: ${resources.food}`);
  }
  if (resources.gold !== undefined) {
    parts.push(`Gold: ${resources.gold}`);
  }
  if (resources.army !== undefined) {
    parts.push(`Army: ${resources.army}`);
  }
  
  return parts.join(', ');
}
