import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import type { NotesGraph } from "../lib/types";

interface GraphModalProps {
  graph: NotesGraph;
  isOpen: boolean;
  onClose: () => void;
  onNodeClick: (slug: string) => void;
}

export function GraphModal({ graph, isOpen, onClose, onNodeClick }: GraphModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    // Force graph engine to mount the container
    // (graph is rendered by force-graph library)
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] bg-white border border-pink-200 p-6">
        <DialogTitle className="font-display text-lg font-semibold text-pink-950">
          Notes Graph
        </DialogTitle>
        <div ref={containerRef} id="graph-container" className="w-[600px] h-[400px]" />
      </DialogContent>
    </Dialog>
  );
}
