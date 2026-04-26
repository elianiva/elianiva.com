import { useEffect, useRef, useState } from "react";
import type { NotesGraph } from "#/types/notes";

interface GraphViewProps {
  graph: NotesGraph;
  onNodeClick?: (slug: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  articles: "#f472b6",
  vault: "#7dd3fc",
  people: "#fcd34d",
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
      <div className="flex items-center justify-center h-full text-pink-950/40 font-body">
        Loading graph...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph
        graphData={graph}
        nodeAutoColorBy="category"
        nodeColor={(node: any) => CATEGORY_COLORS[node.category] || "#f472b6"}
        nodeLabel={(node: any) => node.name}
        nodeRelSize={6}
        linkColor={() => "rgba(244, 114, 182, 0.2)"}
        linkWidth={1}
        backgroundColor="transparent"
        onNodeClick={(node: any) => onNodeClick?.(node.id)}
        width={containerRef.current?.clientWidth}
        height={containerRef.current?.clientHeight}
      />
    </div>
  );
}
