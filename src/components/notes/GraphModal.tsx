import { useEffect } from "react";
import type { NotesGraph } from "#/types/notes";
import { GraphView } from "./GraphView";

interface GraphModalProps {
  graph: NotesGraph;
  isOpen: boolean;
  onClose: () => void;
  onNodeClick?: (slug: string) => void;
}

export function GraphModal({ graph, isOpen, onClose, onNodeClick }: GraphModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-pink-950/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl h-[80vh] bg-white/95 border border-dashed border-pink-200 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-pink-200">
          <h2 className="font-display text-xl font-bold text-pink-950">Notes Graph</h2>
          <button
            onClick={onClose}
            className="p-2 text-pink-950/60 hover:text-pink-950 hover:bg-pink-100/50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 relative">
          <GraphView
            graph={graph}
            onNodeClick={(slug) => {
              onNodeClick?.(slug);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
