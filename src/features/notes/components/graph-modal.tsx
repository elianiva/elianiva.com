import { useEffect, useRef } from "react";
import type { NotesGraph } from "../lib/types";

interface GraphModalProps {
  graph: NotesGraph;
  isOpen: boolean;
  onClose: () => void;
  onNodeClick: (slug: string) => void;
}

export function GraphModal({ graph, isOpen, onClose, onNodeClick }: GraphModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/50 bg-transparent p-0 border-none max-w-[90vw] max-h-[90vh]"
    >
      <div className="bg-white border border-pink-200 p-6 shadow-soft min-w-[300px] min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-lg font-semibold text-pink-950">Notes Graph</h2>
          <button
            onClick={onClose}
            className="text-pink-950/50 hover:text-pink-950 text-xl leading-none focus:outline-none focus:ring focus:ring-pink-400"
            aria-label="Close graph"
          >
            &times;
          </button>
        </div>
        <div id="graph-container" className="w-[600px] h-[400px]" />
      </div>
    </dialog>
  );
}
