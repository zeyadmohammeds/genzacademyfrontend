export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-ink/5 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-ink/5 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 bg-ink/5 rounded-2xl" />
      <div className="h-48 bg-ink/5 rounded-2xl" />
    </div>
  );
}
