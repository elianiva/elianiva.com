import { useEffect, useRef, useState } from "react";
import type { NotesGraph } from "~/types/notes";

interface GraphViewProps {
  graph: NotesGraph;
  onNodeClick?: (slug: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  articles: "#fbbf24",
  vault: "#7dd3fc",
  people: "#f472b6",
  music: "#c084fc",
};

export function GraphView({ graph, onNodeClick }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ForceGraph, setForceGraph] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    import("force-graph").then((mod) => {
      if (!cancelled) setForceGraph(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ForceGraph) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-pink-950/50">
        Loading graph...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] border border-dashed border-pink-200 bg-white/40"
      role="img"
      aria-label="Note relationship graph"
    >
      <ForceGraph
        graphData={graph}
        nodeId="id"
        nodeLabel="name"
        nodeColor={(node: any) => CATEGORY_COLORS[node.category] || "#999"}
        nodeVal={(node: any) => node.val || 4}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        backgroundColor="rgba(0,0,0,0)"
        onNodeClick={(node: any) => onNodeClick?.(node.id)}
        width={containerRef.current?.clientWidth}
        height={400}
      />
    </div>
  );
}
