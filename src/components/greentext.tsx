interface GreentextProps {
  items: string[];
}

export function Greentext({ items }: GreentextProps) {
  return (
    <div className="border-l-4 border-pink-300 bg-pink-50/40 p-4 my-6 font-mono text-sm">
      {items.map((item, i) => (
        <p key={i} className="text-green-700 mb-1 last:mb-0">
          &gt;{item}
        </p>
      ))}
    </div>
  );
}
