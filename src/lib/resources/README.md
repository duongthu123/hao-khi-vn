# Resource Manager

Core logic for managing resource transactions with validation and atomic operations.

## Overview

The resource manager provides a functional API for handling game resources (food, gold, army) with:
- Transaction validation
- Atomic operations (all-or-nothing)
- Resource cap enforcement
- Transaction logging for debugging
- Cost calculation with modifiers

## Usage

### Basic Operations

```typescript
import {
  validateResources,
  addResources,
  subtractResources,
  executeAtomicTransaction,
  calculateCost,
} from '@/lib/resources/manager';

// Current resources and caps
const resources = { food: 100, gold: 50, army: 10 };
const caps = { food: 1000, gold: 1000, army: 100 };

// Add resources (with cap enforcement)
const addResult = addResources(
  resources,
  caps,
  { food: 50, gold: 25 },
  'Resource generation'
);
// addResult.resources = { food: 150, gold: 75, army: 10 }
// addResult.transactions = [...]

// Subtract resources (with validation)
const subtractResult = subtractResources(
  resources,
  { food: 30, gold: 20 },
  'Build barracks'
);
// subtractResult.success = true
// subtractResult.resources = { food: 70, gold: 30, army: 10 }
```

### Validation

```typescript
// Check if resources are sufficient
const validation = validateResources(resources, { food: 150, gold: 100 });
if (!validation.valid) {
  console.log(validation.message); // "Insufficient resources. Missing: food: 50, gold: 50"
  console.log(validation.missing); // { food: 50, gold: 50 }
}
```

### Atomic Transactions

Atomic transactions ensure all operations succeed or none do (all-or-nothing):

```typescript
const operations = [
  { type: 'subtract', resources: { food: 50, gold: 30 }, reason: 'Research cost' },
  { type: 'add', resources: { army: 5 }, reason: 'Units trained' },
  { type: 'subtract', resources: { army: 2 }, reason: 'Deploy units' },
];

const result = executeAtomicTransaction(resources, caps, operations);
if (result.success) {
  // All operations succeeded
  console.log(result.resources);
  console.log(result.transactions);
} else {
  // At least one operation failed, no changes made
  console.log('Transaction failed, resources unchanged');
}
```

### Cost Calculation

```typescript
const baseCost = { food: 100, gold: 50 };

// Apply 50% discount
const discountedCost = calculateCost(baseCost, 0.5);
// { food: 50, gold: 25 }

// Apply 20% increase
const increasedCost = calculateCost(baseCost, 1.2);
// { food: 120, gold: 60 }
```

### Transaction Logging

```typescript
import { getTransactionLog, clearTransactionLog } from '@/lib/resources/manager';

// Get all transactions
const log = getTransactionLog();
log.forEach(transaction => {
  console.log(transaction.type); // 'add' | 'subtract'
  console.log(transaction.resource); // ResourceType
  console.log(transaction.amount);
  console.log(transaction.reason);
  console.log(transaction.timestamp);
  console.log(transaction.success);
});

// Clear log
clearTransactionLog();
```

## Integration with Zustand Store

The resource manager is designed to work with the Zustand resource slice:

```typescript
import { useStore } from '@/store';
import { addResources, subtractResources } from '@/lib/resources/manager';

function MyComponent() {
  const resources = useStore(state => state.resources);
  const setResource = useStore(state => state.setResource);
  
  const handlePurchase = (cost: ResourceCost) => {
    const result = subtractResources(
      resources,
      cost,
      'Purchase item'
    );
    
    if (result.success) {
      // Update store with new resources
      setResource('food', result.resources.food);
      setResource('gold', result.resources.gold);
      setResource('army', result.resources.army);
      
      // Proceed with purchase
      return true;
    } else {
      // Show error message
      alert('Insufficient resources!');
      return false;
    }
  };
}
```

## Features

### Cap Enforcement
Resources cannot exceed their caps. When adding resources, the amount is automatically clamped to the cap.

### Validation
All subtract operations are validated before execution. If resources are insufficient, the operation fails and resources remain unchanged.

### Atomic Operations
Complex multi-step transactions can be executed atomically. If any step fails validation, no changes are made.

### Transaction Logging
All transactions are logged with:
- Type (add/subtract)
- Resource type
- Amount
- Reason (for debugging)
- Timestamp
- Success status

Logs are automatically limited to the last 100 transactions and are logged to console in development mode.

### Cost Modifiers
Calculate modified costs for discounts, difficulty adjustments, or research bonuses.

## API Reference

### `validateResources(current, cost)`
Validates if current resources are sufficient for a cost.

**Parameters:**
- `current: Resources` - Current resource amounts
- `cost: ResourceCost` - Required resource amounts

**Returns:** `ResourceValidation`
- `valid: boolean` - Whether resources are sufficient
- `missing?: Partial<Resources>` - Missing amounts (if invalid)
- `message?: string` - Error message (if invalid)

### `addResources(current, caps, toAdd, reason)`
Adds resources with cap enforcement.

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: Resources` - Resource caps
- `toAdd: Partial<Resources>` - Resources to add
- `reason: string` - Transaction reason (for logging)

**Returns:** `{ resources: Resources; transactions: ResourceTransaction[] }`

### `subtractResources(current, toSubtract, reason)`
Subtracts resources with validation.

**Parameters:**
- `current: Resources` - Current resource amounts
- `toSubtract: ResourceCost` - Resources to subtract
- `reason: string` - Transaction reason (for logging)

**Returns:** `{ resources: Resources; transactions: ResourceTransaction[]; success: boolean }`

### `executeAtomicTransaction(current, caps, operations)`
Executes multiple operations atomically (all-or-nothing).

**Parameters:**
- `current: Resources` - Current resource amounts
- `caps: Resources` - Resource caps
- `operations: Array<{ type, resources, reason }>` - Operations to execute

**Returns:** `{ resources: Resources; transactions: ResourceTransaction[]; success: boolean }`

### `calculateCost(baseCost, modifier)`
Calculates modified cost.

**Parameters:**
- `baseCost: ResourceCost` - Base cost
- `modifier: number` - Cost modifier (default: 1.0)

**Returns:** `ResourceCost`

### `formatResources(resources)`
Formats resources for display.

**Parameters:**
- `resources: Partial<Resources>` - Resources to format

**Returns:** `string` - Formatted string (e.g., "Food: 100, Gold: 50")

### `getTransactionLog()`
Gets the transaction log.

**Returns:** `ResourceTransaction[]`

### `clearTransactionLog()`
Clears the transaction log.
