interface TermPopoverProps {
  term: string;
  definition: string;
}

export function TermPopover({ term, definition }: TermPopoverProps) {
  return (
    <span className="group relative inline cursor-help">
      <span className="border-b border-dashed border-pink-400 text-pink-700 font-medium">
        {term}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white border border-pink-200 shadow-lg text-sm text-pink-950 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {definition}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-pink-200" />
      </span>
    </span>
  );
}
