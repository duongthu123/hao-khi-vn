import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * SaveLoadMenuSkeleton Component
 * Loading skeleton for save/load menu
 * **Implements: Requirement 23.4 - Loading skeletons for content loading**
 */
export function SaveLoadMenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="relative border-2 border-gray-200 rounded-lg p-4 space-y-3"
        >
          {/* Slot number badge skeleton */}
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-200 rounded-full animate-pulse" />

          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="rectangular" width={60} height={28} className="rounded" />
          </div>

          {/* Progress bar skeleton */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton variant="text" width={60} height={12} />
              <Skeleton variant="text" width={40} height={12} />
            </div>
            <Skeleton variant="rectangular" height={8} className="w-full rounded-full" />
          </div>

          {/* Resources skeleton */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={40} height={12} />
              </div>
            ))}
          </div>

          {/* Timestamp skeleton */}
          <div className="space-y-1">
            <SkeletonText lines={2} spacing="tight" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-2 pt-2">
            <Skeleton variant="rectangular" height={36} className="flex-1 rounded" />
            <Skeleton variant="rectangular" width={44} height={36} className="rounded" />
            <Skeleton variant="rectangular" width={44} height={36} className="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
