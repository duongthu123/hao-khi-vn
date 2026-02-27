import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

/**
 * QuizModuleSkeleton Component
 * Loading skeleton for quiz module
 * **Implements: Requirement 23.4 - Loading skeletons for content loading**
 */
export function QuizModuleSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width={200} height={32} />
            <div className="flex items-center gap-4">
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="rectangular" width={80} height={32} className="rounded-full" />
            </div>
          </div>

          {/* Progress bar skeleton */}
          <Skeleton variant="rectangular" height={8} className="w-full rounded-full" />
        </CardHeader>

        <CardBody>
          {/* Question category badges skeleton */}
          <div className="flex items-start gap-2 mb-4">
            <Skeleton variant="rectangular" width={60} height={24} className="rounded" />
            <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
          </div>

          {/* Question text skeleton */}
          <div className="mb-6">
            <SkeletonText lines={2} spacing="normal" />
          </div>

          {/* Answer options skeleton */}
          <div className="space-y-3 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rectangular"
                height={56}
                className="w-full rounded-lg"
              />
            ))}
          </div>

          {/* Action button skeleton */}
          <div className="flex justify-end">
            <Skeleton variant="rectangular" width={120} height={40} className="rounded" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
