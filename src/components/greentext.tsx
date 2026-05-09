interface GreentextProps {
  items: string[];
}

export function Greentext({ items }: GreentextProps) {
  return (
    <div className="border-l border-pink-300 bg-pink-50/40 p-4 my-6 font-mono text-sm">
      {items.map((item) => (
        <p key={item} className="text-green-700 mb-1 last:mb-0">
          &gt;{item}
        </p>
      ))}
    </div>
  );
}
