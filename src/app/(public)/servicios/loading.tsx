export default function ServicesLoading() {
  return (
    <main className="w-full min-h-screen bg-[#FAF8FF] py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Hero Skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-pulse">
          <div className="h-4 w-32 bg-ananda-200/60 rounded-full mx-auto mb-4" />
          <div className="h-10 w-3/4 bg-ananda-200/80 rounded-2xl mx-auto mb-4" />
          <div className="h-5 w-2/3 bg-ananda-100 rounded-lg mx-auto" />
        </div>

        {/* Categories Filter Skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mb-14 animate-pulse">
          <div className="h-10 w-24 bg-ananda-200/60 rounded-full" />
          <div className="h-10 w-32 bg-ananda-100 rounded-full" />
          <div className="h-10 w-28 bg-ananda-100 rounded-full" />
          <div className="h-10 w-36 bg-ananda-100 rounded-full" />
        </div>

        {/* Grid of 6 Service Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse glass-card rounded-3xl p-8 border border-ananda-100 flex flex-col justify-between h-72"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 w-24 bg-ananda-100 rounded-full" />
                  <div className="h-4 w-16 bg-ananda-100 rounded-md" />
                </div>
                <div className="h-7 w-3/4 bg-ananda-200/70 rounded-lg mb-3" />
                <div className="h-4 w-full bg-ananda-100 rounded mb-2" />
                <div className="h-4 w-5/6 bg-ananda-100 rounded" />
              </div>
              <div className="pt-6 border-t border-ananda-100 flex justify-between items-center">
                <div className="h-7 w-24 bg-ananda-200/70 rounded-lg" />
                <div className="h-9 w-28 bg-ananda-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
