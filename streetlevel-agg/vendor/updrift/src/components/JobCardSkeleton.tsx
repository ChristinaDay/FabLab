import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo */}
            <Skeleton className="w-12 h-12 rounded-lg" />
            
            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              
              {/* Job Meta */}
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        
        {/* Salary */}
        <Skeleton className="h-4 w-32 mb-3" />
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-22 rounded-full" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </CardFooter>
    </Card>
  )
} 