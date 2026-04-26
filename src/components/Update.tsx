interface UpdateProps {
  date: string;
  children: React.ReactNode;
}

export function Update({ date, children }: UpdateProps) {
  return (
    <div className="border-l-4 border-pink-400 bg-pink-50/60 p-4 my-6">
      <p className="text-xs font-mono text-pink-600 uppercase tracking-wider mb-2">
        Updated on {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="text-pink-950/80">{children}</div>
    </div>
  );
}
