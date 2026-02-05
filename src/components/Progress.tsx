// components/ui/progress.tsx
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-blue-500 h-full rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
