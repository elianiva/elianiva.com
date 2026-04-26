import { useEffect } from "react";
import type { NotesGraph } from "#/types/notes";
import { GraphView } from "./GraphView";
import XIcon from "~icons/ph/x";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[90vw] h-[80vh] bg-white/80 border border-pink-200 shadow-lift">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 border border-pink-200 text-pink-950/60 hover:text-pink-950 hover:bg-white transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
        <GraphView
          graph={graph}
          onNodeClick={(slug) => {
            onNodeClick?.(slug);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
