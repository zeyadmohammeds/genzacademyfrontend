export default function EngineerLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-ink/5 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-ink/5 rounded-2xl" />
        ))}
      </div>
      <div className="h-72 bg-ink/5 rounded-2xl" />
    </div>
  );
}
