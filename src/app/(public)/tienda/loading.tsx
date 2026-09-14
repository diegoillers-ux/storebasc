export default function TiendaLoading() {
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
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-pulse">
          <div className="h-10 w-24 bg-ananda-200/60 rounded-full" />
          <div className="h-10 w-32 bg-ananda-100 rounded-full" />
          <div className="h-10 w-28 bg-ananda-100 rounded-full" />
        </div>

        {/* Grid of Product Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white border border-ananda-100 rounded-3xl p-6 flex flex-col justify-between h-96"
            >
              <div>
                <div className="w-full aspect-square bg-ananda-100/60 rounded-2xl mb-4" />
                <div className="h-3 w-20 bg-ananda-100 rounded mb-2" />
                <div className="h-5 w-3/4 bg-ananda-200/70 rounded-md mb-2" />
                <div className="h-3 w-full bg-ananda-100 rounded" />
              </div>
              <div className="pt-4 border-t border-ananda-100 flex justify-between items-center mt-4">
                <div className="h-6 w-20 bg-ananda-200/70 rounded-md" />
                <div className="h-9 w-24 bg-ananda-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
