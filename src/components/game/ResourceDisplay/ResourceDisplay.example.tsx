'use client';

/**
 * ResourceDisplay Example
 * Demonstrates resource display with notifications and floating text
 */

import React, { useState } from 'react';
import { ResourceDisplay } from './ResourceDisplay';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store';
import { ResourceType } from '@/types/resource';
import { useResourceFeedback } from '@/hooks/useResourceFeedback';

export const ResourceDisplayExample: React.FC = () => {
  const resources = useStore((state) => state.resources);
  const addResource = useStore((state) => state.addResource);
  const subtractResource = useStore((state) => state.subtractResource);
  const canAfford = useStore((state) => state.canAfford);
  const notifications = useStore((state) => state.ui.notifications);
  const removeNotification = useStore((state) => state.removeNotification);

  const {
    notifyResourceGain,
    notifyResourceLoss,
    notifyInsufficientResources,
    notifyLowResources,
  } = useResourceFeedback();

  const handleAddFood = () => {
    const added = addResource(ResourceType.FOOD, 50);
    if (added) {
      notifyResourceGain(ResourceType.FOOD, 50);
    }
  };

  const handleAddGold = () => {
    const added = addResource(ResourceType.GOLD, 30);
    if (added) {
      notifyResourceGain(ResourceType.GOLD, 30);
    }
  };

  const handleAddArmy = () => {
    const added = addResource(ResourceType.ARMY, 10);
    if (added) {
      notifyResourceGain(ResourceType.ARMY, 10);
    }
  };

  const handleSpendResources = () => {
    const cost = {
      [ResourceType.FOOD]: 100,
      [ResourceType.GOLD]: 50,
    };

    const affordability = canAfford(cost);

    if (!affordability.valid && affordability.missing) {
      notifyInsufficientResources(affordability.missing);
      return;
    }

    const foodSuccess = subtractResource(ResourceType.FOOD, 100);
    const goldSuccess = subtractResource(ResourceType.GOLD, 50);

    if (foodSuccess && goldSuccess) {
      notifyResourceLoss(ResourceType.FOOD, 100, 'Xây dựng');
      notifyResourceLoss(ResourceType.GOLD, 50, 'Xây dựng');
    }
  };

  const handleCheckLowResources = () => {
    if (resources.food < resources.caps.food * 0.2) {
      notifyLowResources(ResourceType.FOOD);
    }
    if (resources.gold < resources.caps.gold * 0.2) {
      notifyLowResources(ResourceType.GOLD);
    }
    if (resources.army < resources.caps.army * 0.2) {
      notifyLowResources(ResourceType.ARMY);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Resource Display with Feedback Demo
        </h1>

        {/* Resource Display */}
        <ResourceDisplay
          resources={resources}
          caps={resources.caps}
          generation={resources.generation}
          showDetails={true}
          enableFloatingText={true}
        />

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-white font-bold">Add Resources</h3>
            <Button onClick={handleAddFood} variant="primary" className="w-full">
              +50 Food 🌾
            </Button>
            <Button onClick={handleAddGold} variant="primary" className="w-full">
              +30 Gold 💰
            </Button>
            <Button onClick={handleAddArmy} variant="primary" className="w-full">
              +10 Army ⚔️
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-bold">Actions</h3>
            <Button onClick={handleSpendResources} variant="secondary" className="w-full">
              Spend Resources (100 Food, 50 Gold)
            </Button>
            <Button onClick={handleCheckLowResources} variant="secondary" className="w-full">
              Check Low Resources
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">Features Demonstrated:</h3>
          <ul className="text-gray-300 space-y-1 text-sm">
            <li>✓ Animated resource counters with smooth transitions</li>
            <li>✓ Floating text animations for resource gains/losses</li>
            <li>✓ Toast notifications for resource changes</li>
            <li>✓ Error messages for insufficient resources</li>
            <li>✓ Warning indicators for low resources</li>
            <li>✓ Detailed tooltips with resource information</li>
            <li>✓ Progress bars with animated updates</li>
          </ul>
        </div>
      </div>

      {/* Notification Toast Container */}
      <NotificationToast
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
  );
};

export default ResourceDisplayExample;
