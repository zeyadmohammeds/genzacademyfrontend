export default function ParentLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-ink/5 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-40 bg-ink/5 rounded-2xl" />
        ))}
      </div>
      <div className="h-56 bg-ink/5 rounded-2xl" />
    </div>
  );
}
