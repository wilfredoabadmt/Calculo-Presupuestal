export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded-xl mb-6" />
          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2 mb-6" />
          <div className="h-10 bg-muted rounded mb-4" />
          <div className="h-10 bg-muted rounded mb-4" />
          <div className="h-10 bg-muted rounded mb-4" />
        </div>
      </div>
    </div>
  )
}