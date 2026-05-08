export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-72 bg-gray-800 rounded-lg" />
      <div className="h-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg" />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-900 border border-gray-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-96 bg-gray-900 border border-gray-800 rounded-2xl" />
    </div>
  )
}
