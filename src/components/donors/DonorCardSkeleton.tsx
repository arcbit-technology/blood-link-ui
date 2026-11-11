import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DonorCardSkeleton() {
  return (
    <Card className="flex h-full w-full flex-col bg-card border-border overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="relative p-4 pb-8 bg-gradient-to-br from-primary/5 to-transparent">
          <Skeleton className="h-5 w-32" />
          <div className="absolute -bottom-6 right-4">
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-4 pt-8 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        <div className="mt-auto px-4 py-3 bg-muted/50 border-t text-center">
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
